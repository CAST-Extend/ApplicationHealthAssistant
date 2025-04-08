#!/bin/bash -e

if [ "${IS_VAULT_INTEGRATED}" = "false" ]; then
    echo "IS_VAULT_INTEGRATED is set to false. Starting application without connecting to Vault."
    # Exec replaces the shell so execution does not resume
    exec "$@"
fi

# The vault integrations take a backoff and retry approach to failed vault calls.
# 10 retries will be made, with the backoff time increasing by 5 seconds on each retry.
# Almost 5 minutes can be spent trying to connect to vault. 
DATA_PATH=.data.data
UI_ENV_VAR_CONFIG="ui_env_vars.txt"
API_PYTHON_ENV_VAR_CONFIG="python_env_vars.txt"

# For information on authenticating with Vault when hosting within AWS, please refer to:
# https://mmcglobal.sharepoint.com/sites/OpenSourceStack/SitePages/Cn.aspx
if [ "${VAULT_USE_AWS_AUTH}" = "true" ]; then
    echo "VAULT_USE_AWS_AUTH is set to $VAULT_USE_AWS_AUTH. Authentication with Vault will use AWS auth."

    echo "Validating that the required environment variables have been set..."
    REQUIRED_ENV_VARS=("AWS_ROLE_ARN" "VAULT_AWS_AUTH_BACKEND" "VAULT_AWS_REGION" "VAULT_ADDR" "VAULT_NAMESPACE")
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo "WARNING: $var has not been set."
        else
            echo "$var has been set with a value of: ${!var}"
        fi
    done

    # The file containing the web identity token to use for authenticating with the AWS Security Token Service.
    # This is automatically injected into the Pod when the Pod runs as a service account with an AWS Role ARN annotation.
    AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token

    echo "Checking that the AWS Web Identity file is available..."
    if [ ! -r $AWS_WEB_IDENTITY_TOKEN_FILE ]; then
        echo "WARNING: The AWS Web Identity file does not appear to be available. Is the Pod definitely running using a service account with the correct AWS Role ARN annotation? "
    else
        echo  "The AWS Web Identity file is available within the Pod."
    fi

    echo "Attempting to retrieve temporary credentials from AWS..."

    retry_count=0
    while [ "$STATUS_CODE" != "200" ]
    do
        retry_count=$((retry_count+1))
        echo "Attempt number: $retry_count"

        backoff_time=$((5*retry_count))
        echo "Backoff time if request fails: $backoff_time"

        STATUS_CODE="$(curl --request GET -G \
            --silent \
            --show-error \
            --output response.txt \
            --write-out "%{http_code}" \
            --location \
            -H 'Accept: application/json' \
            -d 'Action=AssumeRoleWithWebIdentity' \
            -d 'DurationSeconds=900' \
            -d "RoleArn=${AWS_ROLE_ARN}" \
            -d 'RoleSessionName=container_session' \
            -d "WebIdentityToken=$(cat "$AWS_WEB_IDENTITY_TOKEN_FILE")" \
            -d 'Version=2011-06-15' \
            https://sts.amazonaws.com/)"

        ## Going to retry 10 times
        if [ $retry_count -eq 10 ]; then
            >&2 echo "Failed to retrieve temporary credentials from AWS: $(cat response.txt)"
            exit 1
        elif [ "$STATUS_CODE" != "200" ]; then
            >&1 echo "Attempt $retry_count: failed to retrieve temporary credentials from AWS: $(cat response.txt) - retrying in $backoff_time seconds"
        fi
        sleep $backoff_time
    done

    echo "Successfully retrieved temporary credentials from AWS."

    # Export these to make them available to the "vault login" call.
    # This is recommended over manually passing them through, see:
    # https://developer.hashicorp.com/vault/docs/auth/aws#via-the-cli
    export AWS_ACCESS_KEY_ID=$(<response.txt jq -r ".AssumeRoleWithWebIdentityResponse.AssumeRoleWithWebIdentityResult.Credentials.AccessKeyId")
    export AWS_SECRET_ACCESS_KEY=$(<response.txt jq -r ".AssumeRoleWithWebIdentityResponse.AssumeRoleWithWebIdentityResult.Credentials.SecretAccessKey")
    export AWS_SESSION_TOKEN=$(<response.txt jq -r ".AssumeRoleWithWebIdentityResponse.AssumeRoleWithWebIdentityResult.Credentials.SessionToken")

    rm response.txt
    STATUS_CODE=""

    echo "Attempting to retrieve Vault token using AWS auth..."
    VAULT_TOKEN="$(mpc vault perform-aws-auth)"

    echo "Succesfully retrieved Vault token using AWS auth."

    # Remove variables that are no longer needed.
    unset AWS_ACCESS_KEY_ID
    unset AWS_SECRET_ACCESS_KEY
    unset AWS_SESSION_TOKEN
else
    # Retrieve the service account's token to be used for requesting a vault auth token.
    JWT=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)

    echo "Attempting to retrieve Vault token using Kubernetes auth..."

    retry_count=0
    while [ "$STATUS_CODE" != "200" ]
    do
        retry_count=$((retry_count+1))
        echo "Attempt number: $retry_count"
        backoff_time=$((5*retry_count))
        echo "Backoff time if request fails: $backoff_time"
        echo "Vault role name: $VAULT_ROLE_NAME"
        echo "Vault url: $VAULT_URL"
        echo "Vault namespace: $VAULT_NAMESPACE"
        # Make the request to vault to get the auth token.
        STATUS_CODE=$(curl --silent --show-error \
        --output response.txt --write-out "%{http_code}" \
        --location --request POST "$VAULT_URL" \
        --header "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "role": "'"$VAULT_ROLE_NAME"'",
            "jwt": "'"$JWT"'"
        }')
        ## Going to retry 10 times
        if [ $retry_count -eq 10 ]; then
            >&2 echo "Failed to retrieve Vault token: $(cat response.txt)"
            exit 1
        elif [ "$STATUS_CODE" != "200" ]; then
            >&1 echo "Attempt $retry_count: failed to retrieve Vault token: $(cat response.txt) - retrying in $backoff_time seconds"
        fi
        sleep $backoff_time
    done

    VAULT_TOKEN=$(<response.txt jq -r '.auth.client_token')

    echo "Succesfully retrieved Vault token using Kubernetes auth."

    rm response.txt
    STATUS_CODE=""
fi

echo "Retrieving secrets from vault using auth token ..."

retry_count=0
while [ "$STATUS_CODE" != "200" ]
do
    retry_count=$((retry_count+1))
    echo "Attempt number: $retry_count"
    backoff_time=$((5*retry_count))
    echo "Backoff time if request fails: $backoff_time"

    # Make the request to vault to get the secrets.
    STATUS_CODE=$(curl --silent --show-error \
    --output response.txt --write-out "%{http_code}" \
    --location --request GET "$SECRETS_URL" \
    --header "X-Vault-Namespace: ${VAULT_NAMESPACE}" \
    --header "X-Vault-Token: ${VAULT_TOKEN}")

    ## Going to retry 10 times
    if [ $retry_count -eq 10 ]; then
        >&2 echo "Failed to retrieve secrets: $(cat response.txt)"
        exit 1
    elif [ "$STATUS_CODE" != "200" ]; then
        >&1 echo "Attempt $retry_count: failed to retrieve secrets: $(cat response.txt) - retrying in $backoff_time seconds"
    fi
    sleep $backoff_time
done
echo "Begin processing keys"
# Extract all the secrets from Vault and export as env vars.
# `|| true` allows this to succeed if grep finds nothing.
echo "Checking for keys using ${DATA_PATH} path"
keys=$(<response.txt jq -r "${DATA_PATH}//empty | to_entries | .[].key")
if [ "${keys}" = "" ];
then
    echo "Nothing found at ${DATA_PATH} using .data path instead"
    DATA_PATH=.data
    keys=$(<response.txt jq -r "${DATA_PATH}//empty | to_entries | .[].key")
fi
echo "keys: $keys"
for key in $keys; do
    key=${key//$'\r'}
    value=$(<response.txt jq -r "${DATA_PATH}.${key}")
    firstChars=${value:0:4}
    echo "process $key from vault $firstChars"
    export "$key"="$value"
done
echo "Done processing keys"
rm response.txt

if [ "${APP_TYPE}" = "UI" ]; then
    echo "App type is UI, creating UI config file"
    # Save the Vault UI env vars to a config file
    printenv | grep "^UI_" > "$UI_ENV_VAR_CONFIG"
    # Search/replace minified code with values from the config file
    shopt -s globstar
    filenames="/usr/share/nginx/html/**/*.js"
    while read -r line; do
        key=$(echo "$line" | cut -f1 -d=)
        search="\${{ *${key} *}}"
        replace=$(echo "$line" | cut -f2- -d=)
        for file in $filenames; do
            # ASCII unit separator ($'\037') is used as the delimiter to increase robustness
            sed -i "s"$'\037'"$search"$'\037'"$replace"$'\037'"g" "$file"
        done
    done < "$UI_ENV_VAR_CONFIG"
    rm "${UI_ENV_VAR_CONFIG}"
    echo "Completed UI config generation"
fi
if [ "${APP_TYPE}" = "API_PYTHON" ]; then
    echo "App type is API_PYTHON, creating pytbon config file"
    # Save the Vault UI env vars to a config file
    printenv | grep "^API_PYTHON_" > "$API_PYTHON_ENV_VAR_CONFIG"
    # Search/replace minified code with values from the config file
    shopt -s globstar
    filenames="/home/python/app/config.py"
    while read -r line; do
        key=$(echo "$line" | cut -f1 -d=)
        search="\${{ *${key} *}}"
        replace=$(echo "$line" | cut -f2- -d=)
        
        for file in $filenames; do
            # ASCII unit separator ($'\037') is used as the delimiter to increase robustness
            sed -i "s"$'\037'"$search"$'\037'"$replace"$'\037'"g" "$file"
        done
    done < "$API_PYTHON_ENV_VAR_CONFIG"
    rm "${API_PYTHON_ENV_VAR_CONFIG}"
    echo "Completed API Python config generation"
fi
# Start the app, passing through any parameters that have been supplied.
exec "$@"

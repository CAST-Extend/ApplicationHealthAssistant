class Config:

    MODEL_NAME = 'ITAPPS_MMC_gpt-4o'
    MODEL_VERSION = '2023-03-15-preview'
    MODEL_URL = 'https://itappsopenai.openai.azure.com/openai/deployments/ITAPPS_MMC_gpt-4o/chat/completions?api-version=2023-03-15-preview'
    MODEL_API_KEY = 'a9d6aef4b8df4841ba806cf69de42725'
    MODEL_MAX_INPUT_TOKENS = 4096
    MODEL_MAX_OUTPUT_TOKENS = 4096

    IMAGING_URL = 'http://192.168.1.5:5000/'
    IMAGING_API_KEY = ''

    MONGODB_CONNECTION_STRING = 'mongodb://127.0.0.1:27017/ApplicationHDev'

    MAX_THREADS = 20
    MODEL_INVOCATION_DELAY_IN_SECONDS = 10

    


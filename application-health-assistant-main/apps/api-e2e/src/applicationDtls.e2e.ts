import { beforeAll, expect, test } from '@jest/globals';
import supertest from 'supertest';

import { GetApplicationDtlsResponse } from '@application-health-assistant/shared-api-model/model/applicationDtls';

import { getClientCredentialsAuthToken } from './helper';
import { isLive } from './setup';

const { API_API_BASE_URL } = process.env;

let api;
let AUTH_TOKEN;
let request;

const applicationDtlsUrl = '/api/v1/applicationDtls';

const applicationDtlAppName = `applicationDtl for E2E tests ${new Date().toISOString()}`;
let applicationDtlUrl: string;

/**
 * Captures the response object to see content-type has application/json.
 * @param {supertest.Response} response - Instance of Supertest response
 */
function checkResponseType(response: supertest.Response) {
    expect(response.get('Content-Type')).toBe('application/json; charset=utf-8');
}

beforeAll(async () => {
    AUTH_TOKEN = await getClientCredentialsAuthToken();
    const hook = (url, method) => (args) =>
        supertest(url)[method](args).set('Authorization', `BEARER ${AUTH_TOKEN}`);
    request = (url) => ({
        post: hook(url, 'post'),
        get: hook(url, 'get'),
        put: hook(url, 'put'),
        delete: hook(url, 'delete'),
        patch: hook(url, 'patch'),
    });
    api = request(API_API_BASE_URL);
});

test('creds should not be null', () => {
    expect(AUTH_TOKEN).toBeTruthy();
});

test('Smoke test', async () => {
    const live = await isLive();
    expect(live).toBe(true);
});

test('create a applicationDtl', async () => {
    const response = await api
        .post(applicationDtlsUrl)
        .send({
            SSP_AppName: applicationDtlAppName,
            CAST_AppName: applicationDtlAppName,
            SSP_AppID: 1234,
            CastKey: 'AAPlication Key',
            BranchName: 'Test',
            ProductCode: '1234',
            Repository: 'https://github.com/mmctech',
            lastScanDate: new Date(),
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(201);

    applicationDtlUrl = response.get('Location');
    expect(applicationDtlUrl).toBeDefined();
    expect(applicationDtlUrl.startsWith(`${applicationDtlsUrl}/`)).toBeTruthy();
});

test('get all applicationDtls and check that created applicationDtl is present', async () => {
    const response = await api.get(applicationDtlsUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    const applicationDtl = (
        (response.body as GetApplicationDtlsResponse).applicationDtls || []
    ).find((t) => t.SSP_AppName === applicationDtlAppName);
    expect(applicationDtl).toBeDefined();
});

test('update applicationDtl', async () => {
    const response = await api
        .put(applicationDtlUrl)
        .send({
            id: applicationDtlUrl.slice(applicationDtlsUrl.length + 1), // Since applicationDtlUrl = `${applicationDtlsUrl}/${applicationDtlId}`
            SSP_AppName: applicationDtlAppName,
            CAST_AppName: applicationDtlAppName,
            SSP_AppID: 1234,
            CastKey: 'AAPlication Key',
            BranchName: 'Test',
            ProductCode: '1234',
            Repository: 'https://github.com/mmctech',
            lastScanDate: new Date(),
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(204);
});

test('get individual applicationDtl and check that it was updated', async () => {
    const response = await api.get(applicationDtlUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    expect(response.body).toMatchObject({
        SSP_AppName: applicationDtlAppName,
        CAST_AppName: applicationDtlAppName,
        SSP_AppID: 1234,
        CastKey: 'AAPlication Key',
        BranchName: 'Test',
        ProductCode: '1234',
        Repository: 'https://github.com/mmctech',
        lastScanDate: new Date(),
    });
});

test('delete applicationDtl', async () => {
    const deleteResponse = await api.delete(applicationDtlUrl);
    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await api.get(applicationDtlUrl);
    expect(getResponse.statusCode).toBe(404);
});

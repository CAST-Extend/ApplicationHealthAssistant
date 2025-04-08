import { beforeAll, expect, test } from '@jest/globals';
import supertest from 'supertest';

import { GetEngineOutputsResponse } from '@application-health-assistant/shared-api-model/model/engineOutputs';

import { getClientCredentialsAuthToken } from './helper';
import { isLive } from './setup';

const { API_API_BASE_URL } = process.env;

let api;
let AUTH_TOKEN;
let request;

const engineOutputsUrl = '/api/v1/engineOutputs';

const engineOutputid = `engineOutput for E2E tests ${new Date().toISOString()}`;
let engineOutputUrl: string;

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

test('create a engineOutput', async () => {
    const response = await api
        .post(engineOutputsUrl)
        .send({
            request: [],
            Createddate: new Date(),
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(201);

    engineOutputUrl = response.get('Location');
    expect(engineOutputUrl).toBeDefined();
    expect(engineOutputUrl.startsWith(`${engineOutputsUrl}/`)).toBeTruthy();
});

test('get all engineOutputs and check that created engineOutput is present', async () => {
    const response = await api.get(engineOutputsUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    const engineOutput = ((response.body as GetEngineOutputsResponse).engineOutputs || []).find(
        (t) => t.id === engineOutputid
    );
    expect(engineOutput).toBeDefined();
});

test('update engineOutput', async () => {
    const response = await api
        .put(engineOutputUrl)
        .send({
            id: engineOutputUrl.slice(engineOutputsUrl.length + 1), // Since engineOutputUrl = `${engineOutputsUrl}/${engineOutputId}`
            request: [],
            Createddate: new Date(),
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(204);
});

test('get individual engineOutput and check that it was updated', async () => {
    const response = await api.get(engineOutputUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    expect(response.body).toMatchObject({
        request: [],
        Createddate: new Date(),
    });
});

test('delete engineOutput', async () => {
    const deleteResponse = await api.delete(engineOutputUrl);
    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await api.get(engineOutputUrl);
    expect(getResponse.statusCode).toBe(404);
});

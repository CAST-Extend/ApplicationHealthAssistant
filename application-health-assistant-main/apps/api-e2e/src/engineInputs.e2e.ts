import { beforeAll, expect, test } from '@jest/globals';
import supertest from 'supertest';

import { GetEngineInputsResponse } from '@application-health-assistant/shared-api-model/model/engineInputs';

import { getClientCredentialsAuthToken } from './helper';
import { isLive } from './setup';

const { API_API_BASE_URL } = process.env;

let api;
let AUTH_TOKEN;
let request;

const engineInputsUrl = '/api/v1/engineInputs';

const engineInputid = `engineInput for E2E tests ${new Date().toISOString()}`;
let engineInputUrl: string;

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

test('create a engineInput', async () => {
    const response = await api
        .post(engineInputsUrl)
        .send({
            request: [],
            Createddate: new Date(),
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(201);

    engineInputUrl = response.get('Location');
    expect(engineInputUrl).toBeDefined();
    expect(engineInputUrl.startsWith(`${engineInputsUrl}/`)).toBeTruthy();
});

test('get all engineInputs and check that created engineInput is present', async () => {
    const response = await api.get(engineInputsUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    const engineInput = ((response.body as GetEngineInputsResponse).engineInputs || []).find(
        (t) => t.id === engineInputid
    );
    expect(engineInput).toBeDefined();
});

test('update engineInput', async () => {
    const response = await api
        .put(engineInputUrl)
        .send({
            id: engineInputUrl.slice(engineInputsUrl.length + 1), // Since engineInputUrl = `${engineInputsUrl}/${engineInputId}`
            request: [],
            Createddate: new Date(),
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(204);
});

test('get individual engineInput and check that it was updated', async () => {
    const response = await api.get(engineInputUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    expect(response.body).toMatchObject({
        request: [],
        Createddate: new Date(),
    });
});

test('delete engineInput', async () => {
    const deleteResponse = await api.delete(engineInputUrl);
    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await api.get(engineInputUrl);
    expect(getResponse.statusCode).toBe(404);
});

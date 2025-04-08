import { beforeAll, expect, test } from '@jest/globals';
import supertest from 'supertest';

import { GetIssueDetailsResponse } from '@application-health-assistant/shared-api-model/model/issueDetails';

import { getClientCredentialsAuthToken } from './helper';
import { isLive } from './setup';

const { API_API_BASE_URL } = process.env;

let api;
let AUTH_TOKEN;
let request;

const issueDetailsUrl = '/api/v1/issueDetails';

const issueDetailAppName = `issueDetail for E2E tests ${new Date().toISOString()}`;
let issueDetailUrl: string;

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

test('create a issueDetail', async () => {
    const response = await api
        .post(issueDetailsUrl)
        .send({
            name: issueDetailAppName,
            issuelist: 'Initial description',
            priority: 100,
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(201);

    issueDetailUrl = response.get('Location');
    expect(issueDetailUrl).toBeDefined();
    expect(issueDetailUrl.startsWith(`${issueDetailsUrl}/`)).toBeTruthy();
});

test('get all issueDetails and check that created issueDetail is present', async () => {
    const response = await api.get(issueDetailsUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    const issueDetail = ((response.body as GetIssueDetailsResponse).issueDetails || []).find(
        (t) => t.issueId === issueDetailAppName
    );
    expect(issueDetail).toBeDefined();
});

test('update issueDetail', async () => {
    const response = await api
        .put(issueDetailUrl)
        .send({
            id: issueDetailUrl.slice(issueDetailsUrl.length + 1), // Since issueDetailUrl = `${issueDetailsUrl}/${issueDetailId}`
            description: 'Updated description',
            name: issueDetailAppName,
            priority: 100,
        })
        .set('Content-Type', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(204);
});

test('get individual issueDetail and check that it was updated', async () => {
    const response = await api.get(issueDetailUrl);
    expect(response.statusCode).toBe(200);
    checkResponseType(response);

    expect(response.body).toMatchObject({
        name: issueDetailAppName,
        description: 'Updated description',
        priority: 100,
    });
});

test('delete issueDetail', async () => {
    const deleteResponse = await api.delete(issueDetailUrl);
    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await api.get(issueDetailUrl);
    expect(getResponse.statusCode).toBe(404);
});

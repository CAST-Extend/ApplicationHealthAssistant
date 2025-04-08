import { URL } from 'url';

describe('production Environment', () => {
    const mockOktaObj = {
        clientId: '123434',
        issuer: 'https://mmc.oktapreview.com/oauth2/default',
        redirectUri: 'https://dev-polaris-int.np.dal.oss2.mrshmc.com/login/callback',
        scopes: ['openid'],
        pkce: true,
    };

    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
        value: {
            hostname: 'experiment-test.com',
        },
    });
    it('should create a URL and override the Okta configurations', () => {
        const newUrl = new URL(mockOktaObj.redirectUri);
        newUrl.hostname = window.location.hostname;
        mockOktaObj.redirectUri = newUrl.href;

        expect(mockOktaObj.redirectUri).toBe('https://experiment-test.com/login/callback');
    });
});

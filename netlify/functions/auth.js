const { createOAuthAppAuth } = require("@octokit/auth-oauth-app");

const auth = createOAuthAppAuth({
    clientType: 'oauth-app',
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
});

const redirectObj = {
    statusCode: 302,
    body: '',
    headers: {
        location: '/'
    }
};

const redirect = (token) => {
    const response = { ...redirectObj };
    if (!token) return response;
    response.headers["Set-Cookie"] = `__Host-github-token=${token}; Path=/; Secure;`;
    return response;
};

exports.handler = async function(event, context) {
    if (!('code' in event.queryStringParameters)) return redirect();
    const { code } = event.queryStringParameters;
    const oauthAuthentication = await auth({ type: 'oauth-user', code });
    return redirect(oauthAuthentication.token);
};
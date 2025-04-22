const { Octokit } = require("@octokit/core");

const parseCookie = (/** @type {string} */ str) =>
    str
      .split(';')
      .map(v => v.split('='))
      .reduce((/** @type {{ [key: string]: string }} */acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      }, {});

exports.getOctokitClient = async function(request) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    let client;
    try {
        const cookies = parseCookie(request.headers.cookie);
        const token = cookies[DEV ? 'token' : '__Host-github-token'];
        client = new Octokit({ auth: token });
    } catch (error) {
        throw Error('Error occurred while authenticating Octokit client: ' + error);
    }
    return client;
};
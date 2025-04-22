const { commonProps } = require('./constants');

exports.checkAuthentication = async function(client) {
    // Make sure the authenticated Octokit client has write access to the public robustrambles/site repo
    const response = await client.request('GET /repos/{owner}/{repo}', {
        ...commonProps,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    if (response.status > 299 || response.status < 200) {
        throw new Error(`Unexpected status code: ${response.status}`);
    }
    if (response.data.permissions.push !== true) {
        throw new Error('The authenticated user does not have write access to the robustrambles/site repo');
    }
}
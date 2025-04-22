const { stringify } = require('yaml');
const { getOctokitClient } = require('./lib/getOctokitClient');
const { checkAuthentication } = require('./lib/checkAuthentication');
const { commonProps } = require('./lib/constants');
const { toSlug } = require('./lib/toSlug');
const { btoa } = require('./lib/btoa');

exports.handler = async function(event, context) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    const { id, folder, title, description, keywords, comments } = JSON.parse(event.body);
    try {
        const client = await getOctokitClient(event);
        await checkAuthentication(client);
    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify(DEV ? { error: error.toString() } : { error: true }),
        };
    }
    const fileData = stringify({
        id,
        folder,
        title,
        description,
        keywords,
        comments,
    });
    await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `data/${id}.yml`,
        content: btoa(fileData),
        message: `Add new item "${id}"`,
    });
    return {
        statusCode: 200,
        body: '{ "success": true }',
    };
};
const { stringify } = require('yaml');
const { getOctokitClient } = require('./lib/getOctokitClient');
const { checkAuthentication } = require('./lib/checkAuthentication');
const { commonProps, commonResponse } = require('./lib/constants');
const { toSlug } = require('./lib/toSlug');
const { btoa } = require('./lib/btoa');

const getItem = async (client, id) => 
    client.request('GET /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `data/${id}.yml`,
    });

const createItem = async (client, id, fileData) => 
    client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `data/${id}.yml`,
        content: btoa(fileData),
        message: `Add new item "${id}"`,
    });

const updateItem = async (client, id, fileData, sha) => 
    client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `data/${id}.yml`,
        content: btoa(fileData),
        message: `Update item "${id}"`,
        sha
    });

exports.handler = async function(event, context) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    const { id, folder, title, description, keywords, timestamp, comments } = JSON.parse(event.body);
    let client;
    try {
        client = await getOctokitClient(event);
        await checkAuthentication(client);
    } catch (error) {
        return {
            ...commonResponse,
            statusCode: 401,
            body: JSON.stringify(DEV ? { error: error.toString() } : { error: true }),
        };
    }
    let sha = null;
    try {
        const item = await getItem(client, id);
        sha = item.data.sha;
    } catch {
        // Assume the item doesn't exist
    }
    try {
        const fileData = stringify({
            id,
            folder,
            title,
            description,
            keywords,
            timestamp,
            comments,
        });
        if (sha) {
            console.log('Updating with ', sha);
            await updateItem(client, id, fileData, sha);
        } else {
            console.log('creating')
            await createItem(client, id, fileData);
        }
    } catch (e) {
        return {
            ...commonResponse,
            statusCode: 500,
            body: JSON.stringify(DEV ? { error: e.toString() } : { error: true }),
        };
    }
    return {
        ...commonResponse,
        body: '{ "success": true }',
    };
};
import { Router } from 'itty-router';

// now let's create a router (note the lack of "new")
const router = Router();

async function getKeys(env) {
    let arr = [];
    let data = await env.API.list();
    data.keys.forEach(i => {
        arr.push(i.name);
    });
    return arr;
}

// Get all keys in the KV namespace
router.get('/api/kv', async (request, env) => {
    let data = await env.API.list();
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        status: 200,
    });
});

// Get a specific key in the KV namespace
router.get('/api/kv/:key', async (request, env) => {
    let key = request.params.key;
    let value = await env.API.get(key);
    let data = {
        key: key,
        value: value,
    };
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        status: 200,
    });
});

// Set a specific key in the KV namespace
router.post('/api/kv', async (request, env) => {
    let keys = await getKeys(env);
    const body = await request.json();
    const key = body.key;
    const value = body.value;
    let data = {
        key: key,
    };

    if (keys.includes(key)) {
        data.message = 'Key with name ' + key + ' already exists';
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            status: 409,
        });
    }

    await env.API.put(key, value);
    data.message = 'Key with name ' + key + ' has been created';
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        status: 201,
    });
});

// Update a specific key in the KV namespace
router.put('/api/kv', async (request, env) => {
    let keys = await getKeys(env);
    const body = await request.json();
    const key = body.key;
    const value = body.value;
    let data = {
        key: key,
    };

    if (!keys.includes(key)) {
        data.message = 'Key with name ' + key + ' does not exist';
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            status: 404,
        });
    }
    await env.API.put(key, value);
    data.message = 'Key with name ' + key + ' has been updated';
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        status: 200,
    });
});

// Delete a specific key in the KV namespace
router.delete('/api/kv', async (request, env) => {
    let keys = await getKeys(env);
    const body = await request.json();
    const key = body.key;
    let data = {
        key: key,
    };

    if (!keys.includes(key)) {
        data.message = 'Key with name ' + key + ' does not exist';
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            status: 404,
        });
    }
    await env.API.delete(key);
    data.message = 'Key with name ' + key + ' has been deleted';
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        status: 200,
    });
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;

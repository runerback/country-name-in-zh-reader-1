import axios from 'axios';
import { URL } from 'url';
import { Config } from './module';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const requestOnce = async (url: URL): Promise<string> => {
    try {
        const response = await axios.get<string>(url.toString(), {
            headers: {
                Referer: url.toString(),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        return response.data.valueOf();
    } catch (error) {
        console.error(error);
        return '';
    }
};

const tryRequest = async (url: URL, retryCount: number): Promise<string> => {
    for (let i = 0; i < retryCount;) {
        try {
            return await requestOnce(url);
        } catch {
            if (++i < retryCount) {
                continue;
            }
        }
    }

    return '';
}

const getCacheKey = (url: URL): string => {
    const md5 = crypto.createHash('md5');

    md5.update(url.toString());

    const digest = md5.digest('hex');

    return `cache_${digest}.dat`;
};

const getCache = (url: URL, config: Config): string => {
    const key = getCacheKey(url);
    const cacheFile = path.join(config.cachePath, key);

    if (!fs.existsSync(cacheFile)) {
        return '';
    }

    return fs.readFileSync(cacheFile, 'utf-8');
};

const setCache = (url: URL, content: string, config: Config) => {
    const key = getCacheKey(url);
    const cacheFile = path.join(config.cachePath, key);

    fs.writeFileSync(cacheFile, content);
};

export default async function request(uri: string, config: Config, retry: number = 3): Promise<string> {
    let url: URL;
    try {
        url = new URL(uri);
    } catch (error) {
        console.error(error);
        return '';
    }

    console.log(`requesting [${url.toString()}] . . .`);

    const cached = getCache(url, config);
    if (cached) {
        console.log('loaded from cache');
        return cached;
    }

    const wait = Math.floor(Math.random() * Math.floor(10) + 1); // wait for 1 to 10 seconds
    console.log(`waiting for ${wait} seconds . . .`)
    await new Promise(resolve => {
        global.setTimeout(
            () => resolve(),
            wait * 1000
        );
    });

    const response = await tryRequest(url, retry);

    setCache(url, response, config);
    console.log('cached');

    return response;
}
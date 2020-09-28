import { Config, CountryNames, CountryNamesModel, LinkedData } from './module';
import request from './request';
import matches from './matches';
import fs from 'fs';
import path from 'path';
import { Pattern } from './patterns';

const _config = readConfig();

read(_config)
    .then((data: CountryNamesModel[]) => {
        fs.writeFileSync(
            _config.output,
            JSON.stringify(data, null, '  ')
        );
        console.log('done');
    })
    .catch((error: Error) => console.error(error));

function readConfig(): Config {
    const { rootURL_zh_Hans, rootURL_zh_hant, cachePath, output } = (<Config>JSON.parse(fs.readFileSync(
        path.resolve('./config.json'),
        'utf-8')));

    const safeCachePath = path.resolve(cachePath);
    if (!fs.existsSync(safeCachePath)) {
        fs.mkdirSync(safeCachePath);
    }

    return {
        rootURL_zh_Hans,
        rootURL_zh_hant,
        cachePath: safeCachePath,
        output: path.resolve(output)
    };
}

async function read(config: Config): Promise<CountryNamesModel[]> {
    const namesMap = new Map<string, CountryNames>();

    const rootHtml_zh_hans = await request(config.rootURL_zh_Hans, config);
    for (const linkedData of iterator_zh_Hans(rootHtml_zh_hans, config)) {
        namesMap.set(linkedData.name, {
            zh_hans: linkedData.data!.zh_hans!
        });
    }

    const rootHtml_zh_hant = await request(config.rootURL_zh_hant, config);
    for (const linkedData of iterator_zh_Hant(rootHtml_zh_hant, config)) {
        const code3 = linkedData.name;

        if (namesMap.has(code3)) {
            namesMap.set(code3, {
                ...namesMap.get(code3),
                zh_hant: linkedData.data!.zh_hant!
            });
        } else {
            namesMap.set(code3, {
                zh_hant: linkedData.data!.zh_hant!
            });
        }
    }

    return [...namesMap.entries()].map(([k, v]) => ({
        code3: k,
        name_zh_Hans: v.zh_hans ?? '',
        name_zh_Hant: v.zh_hant ?? ''
    }));
}

function* iterator_zh_Hans(html: string, config: Config): IterableIterator<LinkedData<CountryNames>> {
    for (const group of matches(Pattern, ['g', 'i', 's'], html)) {
        yield {
            name: group['code3'].valueOf(),
            url: '',
            data: {
                zh_hans: group['name'].valueOf()
            }
        };
    }
}

function* iterator_zh_Hant(html: string, config: Config): IterableIterator<LinkedData<CountryNames>> {
    for (const group of matches(Pattern, ['g', 'i', 's'], html)) {
        yield {
            name: group['code3'].valueOf(),
            url: '',
            data: {
                zh_hant: group['name'].valueOf()
            }
        };
    }
}
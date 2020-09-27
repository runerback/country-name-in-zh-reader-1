import { Config, CountryNames, CountryNamesModel, LinkedData } from './module';
import request from './request';
import matches from './matches';
import fs from 'fs';
import path from 'path';
import { Pattern } from './patterns';

read()
    .then((data: CountryNamesModel[]) => {
        fs.writeFileSync(
            path.resolve('./countrynames.json'),
            JSON.stringify(data, null, '  ')
        );
        console.log('done');
    })
    .catch((error: Error) => console.error(error));

function readConfig(): Config {
    const { rootURL, cachePath } = (<Config>JSON.parse(fs.readFileSync(
        path.resolve('./config.json'),
        'utf-8')));

    const safeCachePath = path.resolve(cachePath);
    if (!fs.existsSync(safeCachePath)) {
        fs.mkdirSync(safeCachePath);
    }

    return {
        rootURL: rootURL,
        cachePath: safeCachePath
    };
}

async function read(): Promise<CountryNamesModel[]> {
    const config = readConfig();

    const namesSet = Array<CountryNamesModel>();

    const rootHtml = await request(config.rootURL, config);

    for (const linkedData of iterator(rootHtml, config)) {
        namesSet.push({
            code2: linkedData.name,
            name_zh_Hans: linkedData.data!.zh_hans,
            name_zh_Hant: linkedData.data!.zh_hant
        });
    }

    return namesSet;
}

function* iterator(html: string, config: Config): IterableIterator<LinkedData<CountryNames>> {
    for (const group of matches(Pattern, ['g', 'i', 's'], html)) {
        yield {
            name: group['name'].valueOf(),
            url: '',
            data: {
                zh_hans: group['zh_Hans'].valueOf(),
                zh_hant: group['zh_Hant'].valueOf()
            }
        };
    }
}
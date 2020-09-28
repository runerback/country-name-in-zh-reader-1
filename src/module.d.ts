export interface Config {
    readonly rootURL_zh_Hans: string;
    readonly rootURL_zh_hant: string;
    readonly cachePath: string;
}

export interface MatchGroups {
    readonly [key: string]: string;
}

export interface LinkedData<T = any> {
    readonly name: string;
    readonly url: string;
    readonly data?: T;
}

export interface CountryNames {
    readonly zh_hans?: string;
    readonly zh_hant?: string;
}

export interface CountryNamesModel {
    readonly code3: string;
    readonly name_zh_Hans: string;
    readonly name_zh_Hant: string;
}
export interface CategoryData {
    nsfw?: boolean;
    dev?: boolean;
    path?: string;
    name: string;
    key: string;
}

export interface BaseCommandQuery {
    regex?: string;
    path?: string;
}

export interface TextCommandQuery extends BaseCommandQuery {
    categoryKey?: string;
    description?: string;
    aliases?: string[];
    slash?: boolean;
    nsfw?: boolean;
    usage?: string;
    dev?: boolean;
    query: string;
    type: "text";
}

export type CommandQuery = TextCommandQuery;

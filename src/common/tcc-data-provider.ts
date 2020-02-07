import {stringify} from 'query-string';
import {fetchUtils} from 'ra-core';

/**
 * Maps react-admin queries to a json-server powered REST API
 *
 * @see https://github.com/typicode/json-server
 *
 * @example
 *
 * getList          => GET http://my.api.url/posts?_sort=title&_order=ASC&_start=0&_end=24
 * getOne           => GET http://my.api.url/posts/123
 * getManyReference => GET http://my.api.url/posts?author_id=345
 * getMany          => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * create           => POST http://my.api.url/posts/123
 * update           => PUT http://my.api.url/posts/123
 * updateMany       => PUT http://my.api.url/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
 * delete           => DELETE http://my.api.url/posts/123
 *
 * @example
 *
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import jsonServerProvider from 'ra-data-json-server';
 *
 * import { PostList } from './posts';
 *
 * const Home = () => (
 *     <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default Home;
 */
let queryParams = {
    _sort: undefined,
    _order: undefined,
    filters: undefined,
    _start: 0,
    _end: 0
};

const sortDataByField = (data, queryParams) => {
    if (!data || !queryParams._sort) return;

    const sortByNumbers = () => {
        data.sort((a, b) => {
            // @ts-ignore
            const objA = a[queryParams._sort], objB = b[queryParams._sort];
            if (queryParams._order === 'ASC') {
                return objA - objB;
            } else {
                return objB - objA;
            }
        });
    };

    const sortByStrings = () => {
        data.sort((a, b) => {
            // @ts-ignore
            if (a[queryParams._sort] == null || b[queryParams._sort] == null) return 0;
            // @ts-ignore
            const test1 = a[queryParams._sort].toLowerCase(),
                // @ts-ignore
                test2 = b[queryParams._sort].toLowerCase();
            if (queryParams._order === 'ASC') {
                // @ts-ignore
                return (test1 > test2) - (test1 < test2);
            } else {
                // @ts-ignore
                return (test1 < test2) - (test1 > test2);
            }
        });
    };

    // @ts-ignore
    queryParams._sort === 'id' ? sortByNumbers() : sortByStrings();
};

const resolveNestedProperty = (item, keyString) => {
    if (!keyString) return item;
    const keysArray = keyString.split('.');

    return resolveNestedProperty(item[keysArray.shift()], keysArray.join('.'));
};

const escapeSpecialCharsForRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const makeKeyValuePair = (filter) => {
    const key = filter[0];
    const _val = filter[1];//123, [123], 'me@work.com'
    const val = (typeof _val === 'object')
        ? _val[0].toString()
        : _val.toString();

    return [key, val];
};

const applyAllFilters = (list, filters) => {
    if (!list) return [];
    if (!filters.length) return list;

    const [key, val] = makeKeyValuePair(filters.shift());
    if (val === '') return list;
    const regexSafeString = escapeSpecialCharsForRegExp(val);
    const pattern = new RegExp(regexSafeString, 'ig');

    const filteredList = list.filter(item => {
        let toMatch = resolveNestedProperty(item, key.toLocaleLowerCase());
        return toMatch ? toMatch.toString().match(pattern) : false;
    });

    return applyAllFilters(filteredList, filters);
};

const processDataForAdmin = (overrides, serverData, queryParams) => {
    const filteredData = applyAllFilters(serverData, Object.entries(queryParams.filters));
    sortDataByField(filteredData, queryParams);

    return filteredData;
};

const normalizeFilterKeys = (queryParams) => {
    let isFilterQuery = false;

    Object.entries(queryParams.filters).forEach(([key, val]) => {
        const filterQueryKey = /q\?_/;

        if (filterQueryKey.test(key)) {
            let newKey = key.replace(filterQueryKey, '');
            queryParams.filters[newKey] = val;
            delete queryParams.filters[key];
            isFilterQuery = true;
        }
    });

    return isFilterQuery;
};

const normalizeFilterValues = (data, queryParams) => {
    Object.entries(queryParams.filters).forEach(([key, val]) => {
        if (Number.isInteger(<number>val)) {
            let toMatch = data.find(item => {
                if (item.id === val) {
                    return item[key]
                }
            });
            queryParams.filters[key] = toMatch[key];
        }
    });
};

const makeListOfUniqueItems = (overrides, filters, items, uniques) => {
    if (!filters.length) return uniques;
    let uniqueSet = {};
    const [key, val] = makeKeyValuePair(filters.shift());

    if (!val) return;

    if (!overrides.autoCompleteFilters.includes(key)) return uniques;

    const pattern = new RegExp(val, 'ig');

    items.forEach(filtered => {
        if (!filtered[key]) return;
        if (filtered[key].match(pattern)) {
            uniqueSet[filtered[key]] = filtered;
        }
    });

    uniques = Object.keys(uniqueSet).map(key => uniqueSet[key]);

    return uniques;
};

/**
 * React-Admin data provider
 * I've added utility functions to process the data so that it'll work with RA components.
 * All the methods above are mine */
export default function (apiUrl, httpClient = fetchUtils.fetchJson, overrides) {
    return ({
        getList: (resource, params) => {
            debugger
            const {page, perPage} = params.pagination;
            const {field, order} = params.sort;
            const query = {
                ...fetchUtils.flattenObject(params.filter),
                _sort: field,
                _order: order,
                _start: (page - 1) * perPage,
                _end: page * perPage,
            };
            queryParams = {...query, filters: {...fetchUtils.flattenObject(params.filter)}};

            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            return httpClient(url).then(({headers, json}) => {
                const data = overrides.key ? json[overrides.key] : json;
                const isUserFilteringForATerm = normalizeFilterKeys(queryParams);

                normalizeFilterValues(data, queryParams);

                const sortedAndFilteredData = processDataForAdmin(overrides, data, queryParams);

                const actualRecordCount = sortedAndFilteredData.length
                    ? sortedAndFilteredData.length
                    : data.length;

                const recordCount = overrides.paginationHeader
                    ? parseInt(
                        headers
                            .get(overrides.paginationHeader)
                            .split('/')
                            .pop(),
                        10)
                    : actualRecordCount;

                const uniques = (isUserFilteringForATerm)
                    ? makeListOfUniqueItems(
                        overrides,
                        Object.entries(queryParams.filters),
                        data,
                        [])
                    : undefined;

                if (uniques) {
                    sortDataByField(uniques, queryParams);
                }

                const results = uniques
                    ? uniques
                    : sortedAndFilteredData.slice(queryParams._start, queryParams._end);

                return {
                    data: results,
                    total: recordCount,
                };
            });
        },

        getOne: (resource, params) => {
            console.log('..get one');
            return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                return {data: data};
            });
        },

        getMany: (resource, params) => {
            console.log('..get many ');
            const query = {
                id: params.ids,
            };
            let filters = {id: query.id};
            queryParams.filters = filters;
            console.log('..many qparams ', queryParams);
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            return httpClient(url).then(({json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                const sortedAndFilteredData = processDataForAdmin(overrides, data, queryParams);

                console.log('..many sorted ', sortedAndFilteredData);
                return {data: data};
            });
        },

        getManyReference: (resource, params) => {
            console.log('..get reference');
            const {page, perPage} = params.pagination;
            const {field, order} = params.sort;
            const query = {
                ...fetchUtils.flattenObject(params.filter),
                [params.target]: params.id,
                _sort: field,
                _order: order,
                _start: (page - 1) * perPage,
                _end: page * perPage,
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;

            return httpClient(url).then(({headers, json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                let recordCount = overrides.paginationHeader
                    ? parseInt(
                        headers
                            .get(overrides.paginationHeader)
                            .split('/')
                            .pop(),
                        10)
                    : data.length;

                let sortedAndFilteredData = processDataForAdmin(overrides, data, queryParams);

                return {
                    data: sortedAndFilteredData,
                    total: data.length,
                };
            });
        },

        update: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`, {
                method: 'PUT',
                body: JSON.stringify(params.data),
            }).then(({json}) => ({data: json[overrides.key]})),

        // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
        updateMany: (resource, params) =>
            Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${resource}/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(params.data),
                    })
                )
            ).then(responses => ({data: responses.map(({json}) => json.id)})),

        create: (resource, params) =>
            httpClient(`${apiUrl}/${resource}`, {
                method: 'POST',
                body: JSON.stringify(params.data),
            }).then(({json}) => ({
                data: {...params.data, id: json.id},
            })),

        delete: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`, {
                method: 'DELETE',
            }).then(({json}) => ({data: json[overrides.key]})),

        // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
        deleteMany: (resource, params) =>
            Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${resource}/${id}`, {
                        method: 'DELETE',
                    })
                )
            ).then(responses => ({data: responses.map(({json}) => json.id)})),
    });
};

export const _helpers = {
    sortDataByField,
    resolveNestedProperty,
    escapeSpecialCharsForRegExp,
    makeKeyValuePair,
    applyAllFilters,
    processDataForAdmin,
    normalizeFilterKeys,
    normalizeFilterValues,
    makeListOfUniqueItems
};

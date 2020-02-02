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
 * const App = () => (
 *     <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
let queryParams = {};

const sortDataByField = (data) => {
    if (!data || !queryParams._sort) return;

    const sortByNumbers = () => {
        data.sort((a, b) => {
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
            if (a[queryParams._sort] == null || b[queryParams._sort] == null) return 0;

            const test1 = a[queryParams._sort].toLowerCase(),
                test2 = b[queryParams._sort].toLowerCase();

            if (queryParams._order === 'ASC') {
                return (test1 > test2) - (test1 < test2);
            } else {
                return (test1 < test2) - (test1 > test2);
            }
        });
    };

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

const applyAllFilters = (list, filters) => {
    if (!list) return [];
    if (!filters.length) return list;

    let filteredList;
    let [key, val] = filters.shift();

    if (val === '') return list;

    let regexSafeString = escapeSpecialCharsForRegExp(val);
    let pattern = new RegExp(regexSafeString, 'i');

    filteredList = list.filter(item => {
        let toMatch = resolveNestedProperty(item, key.toLocaleLowerCase());
        return toMatch.match(pattern);
    });

    return applyAllFilters(filteredList, filters);
};

const processDataForAdmin = (overrides, serverData) => {
    let filteredData = applyAllFilters(serverData, Object.entries(queryParams.filters));

    sortDataByField(filteredData);

    return filteredData;
};

const normalizeFilterKeys = (queryParams) => {
    let isFilterQuery = false;

    Object.entries(queryParams.filters).forEach(([key, val]) => {
        let filterQueryKey = /q\?_/;

        if (filterQueryKey.test(key)) {
            let newKey = key.replace(filterQueryKey, '');
            queryParams.filters[newKey] = val;
            delete queryParams.filters[key];
            isFilterQuery = true;
        }
    });

    return isFilterQuery;
};

const normalizeFilterValues = (queryParams, data) => {
    Object.entries(queryParams.filters).forEach(([key, val]) => {
        if (Number.isInteger(val)) {
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

    let [key, val] = filters.shift();

    if (!overrides.autoCompleteFilters.includes(key)) {return uniques;}

    items.forEach(filtered => {
        let duplicate = uniques.some(unique => unique[key] === filtered[key]);
        if (!duplicate) {
            uniques.push(filtered);
        }
    });

    return makeListOfUniqueItems(overrides, filters, items, uniques);
};

/**
 * React-Admin data provider
 * I've added utility functions to process the data so that it'll work with RA components.
 * All the methods above are mine */
export default function (apiUrl, httpClient = fetchUtils.fetchJson, overrides) {
    return ({
        getList: (resource, params) => {
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
                let data = overrides.key ? json[overrides.key] : json;
                let isUserFilteringForATerm = normalizeFilterKeys(queryParams);

                normalizeFilterValues(queryParams, data);

                let sortedAndFilteredData = processDataForAdmin(overrides, data);

                let actualRecordCount = sortedAndFilteredData.length
                    ? sortedAndFilteredData.length
                    : data.length;

                let recordCount = overrides.paginationHeader
                    ? parseInt(
                        headers
                            .get(overrides.paginationHeader)
                            .split('/')
                            .pop(),
                        10)
                    : actualRecordCount;

                let uniques = (isUserFilteringForATerm)
                    ? makeListOfUniqueItems(
                        overrides,
                        Object.entries(queryParams.filters),
                        data,
                        [])
                    : undefined;

                let results = uniques || sortedAndFilteredData;

                return {
                    data: results.slice(queryParams._start, queryParams._end),
                    total: recordCount,
                };
            });
        },

        getOne: (resource, params) => {
            return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({json}) => ({
                data: json[overrides.key],
            }))
        },

        getMany: (resource, params) => {
            const query = {
                id: params.ids,
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            return httpClient(url).then(({json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                return {data: data};
            });

        },

        getManyReference: (resource, params) => {
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

                let sortedAndFilteredData = processDataForAdmin(overrides, data);

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

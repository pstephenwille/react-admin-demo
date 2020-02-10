import {stringify} from 'query-string';
import {fetchUtils} from 'ra-core';


type queryParams = {
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
            if (a[queryParams._sort] == null || b[queryParams._sort] == null) return 0;
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
    const _val = filter[1];
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
        if (Number.isInteger(val as number)) {
            let toMatch = data.find(item => {
                return (item.id === val) ? item[key] : false;
            });
            queryParams.filters[key] = toMatch[key];
        }
    });
};

const makeListOfUniqueItems = (overrides, filters, items, uniques) => {
    if (!filters.length) return uniques;
    let uniqueSet = {};
    const [key, val] = makeKeyValuePair(filters.shift());

    if (!overrides.autoCompleteFilters.includes(key)) return uniques;

    const pattern = new RegExp(val, 'ig');

    items.forEach(filtered => {
        if (!filtered[key]) return;
        if (!val) {
            uniqueSet[filtered[key]] = filtered;
        } else if (filtered[key].match(pattern)) {
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
            const {page, perPage} = params.pagination;
            const {field, order} = params.sort;
            const query = {
                ...fetchUtils.flattenObject(params.filter),
                _sort: field,
                _order: order,
                _start: (page - 1) * perPage,
                _end: page * perPage,
            };
            let qParams = {...query, filters: {...fetchUtils.flattenObject(params.filter)}};
            const url = `${apiUrl}/${resource}?${stringify(query)}`;

            return httpClient(url).then(({headers, json}) => {
                const data = overrides.key ? json[overrides.key] : json;
                const isUserFilteringForATerm = normalizeFilterKeys(qParams);
                normalizeFilterValues(data, qParams);
                const sortedAndFilteredData = processDataForAdmin(overrides, data, qParams);
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
                        Object.entries(qParams.filters),
                        data,
                        [])
                    : undefined;

                if (uniques) {
                    sortDataByField(uniques, qParams);
                }

                const results = uniques
                    ? uniques
                    : sortedAndFilteredData.slice(qParams._start, qParams._end);

                return {
                    data: results,
                    total: recordCount,
                };
            });
        },

        getOne: (resource, params) => {
            return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                return {data: data};
            });
        },

        getMany: (resource, params) => {
            const query = {
                id: params.ids,
            };
            let qParams = {filters: params.ids};
            const url = `${apiUrl}/${resource}?${stringify(query)}`;
            return httpClient(url).then(({json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                const sortedAndFilteredData = processDataForAdmin(overrides, data, qParams);

                return {data: sortedAndFilteredData};
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
            let qParams = {...query, filters: {...fetchUtils.flattenObject(params.filter)}};
            const url = `${apiUrl}/${resource}?${stringify(query)}`;

            return httpClient(url).then(({headers, json}) => {
                let data = overrides.key ? json[overrides.key] : json;
                let sortedAndFilteredData = processDataForAdmin(overrides, data, qParams);
                let recordCount = overrides.paginationHeader
                    ? parseInt(
                        headers
                            .get(overrides.paginationHeader)
                            .split('/')
                            .pop(),
                        10)
                    : sortedAndFilteredData.length;

                return {
                    data: sortedAndFilteredData,
                    total: recordCount,
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

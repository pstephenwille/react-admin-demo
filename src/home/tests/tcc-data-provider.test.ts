import {_helpers} from '../../common/tcc-data-provider';
import {TccOverrides} from "../../constants/overrides_const";

describe('TCC data provider', () => {
    let stubbedQueryParams;
    let referenceData = JSON.stringify(require('./stubbed-tcc-data.json').results);
    let stubbedData;

    beforeEach(() => {
        stubbedData = JSON.parse(referenceData);
        stubbedQueryParams = {
            _sort: undefined,
            _order: undefined,
            filters: undefined,
            _start: 0,
            _end: 0
        };
    });

    afterEach(() => {
        stubbedData = undefined;
        stubbedQueryParams = undefined;
    });

    it('sortDataByField() will sort by TEAM name, ASC', () => {
        stubbedQueryParams = {
            _sort: "team",
            _order: "ASC",
            _start: 0,
            _end: 10,
            filters: {}
        };

        _helpers.sortDataByField(stubbedData, stubbedQueryParams);
        const firstTeam = stubbedData[0];
        const lastTeam = stubbedData[4];

        expect(firstTeam.team).toEqual('data-soft-eng');
        expect(lastTeam.team).toEqual('sre');
    });

    it('sortDataByField() will sort by TEAM name, DESC', () => {
        stubbedQueryParams = {
            _sort: "team",
            _order: "DESC",
            _start: 0,
            _end: 10,
            filters: {}
        };

        _helpers.sortDataByField(stubbedData, stubbedQueryParams);
        const firstTeam = stubbedData[0];
        const lastTeam = stubbedData[4];

        expect(firstTeam.team).toEqual('sre');
        expect(lastTeam.team).toEqual('data-soft-eng');
    });

    it('sortDataByField() will sort by ID, ASC', () => {
        stubbedQueryParams = {
            _sort: "id",
            _order: "ASC",
            _start: 0,
            _end: 10,
            filters: {}
        };

        _helpers.sortDataByField(stubbedData, stubbedQueryParams);
        const firstTeam = stubbedData[0];
        const lastTeam = stubbedData[4];

        expect(firstTeam.id).toEqual(5);
        expect(lastTeam.id).toEqual(15);
    });

    it('sortDataByField() will sort by ID, DESC', () => {
        stubbedQueryParams = {
            _sort: "id",
            _order: "DESC",
            _start: 0,
            _end: 10,
            filters: {}
        };

        _helpers.sortDataByField(stubbedData, stubbedQueryParams);
        const firstTeam = stubbedData[0];
        const lastTeam = stubbedData[4];

        expect(firstTeam.id).toEqual(15);
        expect(lastTeam.id).toEqual(5);
    });

    it('resolveNestedProperty() immediately returns item when KEYSTRING is empty', () => {
        const stubbedNestedKeys = {
            person: {name: {first: 'stubbed first name'}}
        };
        const keyString = '';
        const actual = _helpers.resolveNestedProperty(stubbedNestedKeys, keyString);

        expect(actual).toEqual(stubbedNestedKeys);
    });

    it('resolveNestedProperty() will resolve PERSON.NAME.FIRST to value', () => {
        const stubbedNestedKeys = {
            person: {name: {first: 'stubbed first name'}}
        };
        const keyString = 'person.name.first';
        const actual = _helpers.resolveNestedProperty(stubbedNestedKeys, keyString);

        expect(actual).toEqual(stubbedNestedKeys.person.name.first);
    });

    it('escapeSpecialCharsForRegExp() produces a regex safe string', () => {
        const dangerousString = 'data.eng.alerts+qa1@climate.com';
        const actual = _helpers.escapeSpecialCharsForRegExp(dangerousString);
        const expected = 'data\\.eng\\.alerts\\+qa1@climate\\.com';

        expect(actual).toEqual(expected);
    });

    it('makeKeyValuePair() makes pair when supplied with an array of digits - [123]', () => {
        const filter = ["id", [861]];
        const expected = ['id', '861'];
        const actual = _helpers.makeKeyValuePair(filter);

        expect(actual).toEqual(expected);
    });

    it('makeKeyValuePair() makes pair when supplied with a Number - 123', () => {
        const filter = ["id", 861];
        const expected = ['id', '861'];
        const actual = _helpers.makeKeyValuePair(filter);

        expect(actual).toEqual(expected);
    });

    it('makeKeyValuePair() makes pair when supplied with a string - "123"', () => {
        const filter = ["id", 'stubbed@email.test'];
        const expected = ['id', 'stubbed@email.test'];
        const actual = _helpers.makeKeyValuePair(filter);

        expect(actual).toEqual(expected);
    });

    it('applyAllFilters() immediately returns empty array when list is undefined', () => {
        const stubbedFilters = [
            ["team", "sre"],
            ["name", "hello-time"],
            ["alert_email", "mls@climate.com"],
            ["description", "A hello world service that returns the time of day."],
            ["status", "pending"]];
        const stubbedData = [];
        const expected = [];
        const actual = _helpers.applyAllFilters(stubbedData, stubbedFilters);

        expect(actual).toStrictEqual(expected);
    });

    it('applyAllFilters() returns the LIST of items when there are no filters', () => {
        const stubbedFilters = [];
        const expected = stubbedData;
        const actual = _helpers.applyAllFilters(stubbedData, stubbedFilters);

        expect(actual).toStrictEqual(expected);
    });

    it('applyAllFilters() returns the LIST of items when FILTER.VAL is null', () => {
        const stubbedFilters = [["team", ""]];
        const expected = stubbedData;
        const actual = _helpers.applyAllFilters(stubbedData, stubbedFilters);

        expect(actual).toStrictEqual(expected);
    });

    it('applyAllFilters() recursively applies multiple filters to return the correct item', () => {
        const stubbedFilters = [
            ["team", "sre"],
            ["name", "hello-time"],
            ["alert_email", "mls@climate.com"],
            ["description", "A hello world service that returns the time of day."],
            ["status", "pending"]];
        const expected = [stubbedData[3]];
        const actual = _helpers.applyAllFilters(stubbedData, stubbedFilters);

        expect(actual).toStrictEqual(expected);
    });


    it('processDataForAdmin() filters, sorts, and returns the correct items', () => {
        stubbedQueryParams = {
            _sort: "name",
            _order: "ASC",
            _start: 0,
            _end: 10,
            filters: {id: [12]}
        };
        const expected = [stubbedData[3]];
        const actual = _helpers.processDataForAdmin(TccOverrides, stubbedData, stubbedQueryParams);

        expect(actual).toEqual(expected);
    });

    it('normalizeFilterKeys() changes the KEY "q?_alert_email" to "alert_email"', () => {
        stubbedQueryParams = {
            _sort: "",
            _order: "ASC",
            _start: 0,
            _end: 10,
            filters: {'q?_alert_email': 'data.eng.alerts+qa1@climate.com'}
        };

        const expectedKey = 'alert_email';
        const isFilterQuery = _helpers.normalizeFilterKeys(stubbedQueryParams);

        expect(isFilterQuery).toBe(true);
        expect(stubbedQueryParams.filters[expectedKey]).toBeTruthy();
    });

    it('normalizeFilterValues() sets FILTER.VAL to the value of the matched item by ID', () => {
        stubbedQueryParams = {
            _sort: "",
            _order: "ASC",
            _start: 0,
            _end: 10,
            filters: {alert_email: 7}
        };

        const expectedVal = 'data.eng.alerts+qa1@climate.com';
        _helpers.normalizeFilterValues(stubbedData, stubbedQueryParams);

        expect(stubbedQueryParams.filters.alert_email).toEqual(expectedVal);
    });

    it('makeListOfUniqueItems() immediately returns if there are no FILTERS', () => {
        const filters = [];
        const expected = [];
        const actual = _helpers.makeListOfUniqueItems(TccOverrides, filters, stubbedData, []);

        expect(actual).toEqual(expected);
    });

    it('makeListOfUniqueItems() immediately returns if FILTER.VAL is null', () => {
        const filters = [["team", ""]];
        const expected = undefined;
        const actual = _helpers.makeListOfUniqueItems(TccOverrides, filters, stubbedData, []);

        expect(actual).toEqual(expected);
    });

    it('makeListOfUniqueItems() returns LIST of single instances that match the FILTER', () => {
        const filters = [["team", "data-soft-eng"]];
        const actual = _helpers.makeListOfUniqueItems(TccOverrides, filters, stubbedData, []);

        expect(stubbedData[1].team).toEqual('data-soft-eng');
        expect(stubbedData[2].team).toEqual('data-soft-eng');

        expect(actual.length).toBe(1);
    });


});



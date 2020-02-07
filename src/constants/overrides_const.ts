export const TccOverrides = {
    key: 'results',
    autoCompleteFilters: ['name', 'alert_email', 'description', 'team'],
    columnNames: ['name', 'alert_email', 'status', 'description', 'team']
};


export enum TccPaths {
    // @ts-ignore
    base = `${process.env.REACT_APP_TCC_BASE_URL}`,
    resources = '/resources'

}

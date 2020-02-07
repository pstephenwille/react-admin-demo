export const TccOverrides = {
    key: 'results',
    autoCompleteFilters: ['name', 'alert_email', 'description', 'team'],
    columnNames: ['name', 'alert_email', 'status', 'description', 'team']
};


export enum TccPaths {
    base = 'https://metadata.tcc.li/v2',
    resources = '/resources'

}

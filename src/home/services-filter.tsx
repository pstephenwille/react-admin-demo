import React from 'react';
import {
    Filter,
    SearchInput,
    SelectInput,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';

import {tccOverrides} from '../constants/overrides_const';


export default (props) => {
    let filters = tccOverrides.autoCompleteFilters.map(name => (
        <ReferenceInput
            key={name}
            source={name}
            reference="services"
            filterToQuery={searchTerm => ({[`q?_${name}`]: searchTerm})}>
            <AutocompleteInput
                optionText={choice => `${choice[name]}`}
                translateChoice={false}
            />
        </ReferenceInput>

    ));

    return (
        <Filter {...props}>
            {filters}

            <SelectInput
                source="status"
                label={'Status'}
                translateChoice={false}
                choices={[
                    {id: 'production', name: 'production'},
                    {id: 'retired', name: 'retired'},
                    {id: 'deprecated', name: 'deprecated'},
                    {id: 'pending', name: 'pending'},
                    {id: 'testing', name: 'testing'},
                ]}
            />
        </Filter>
    )
};

import React from 'react';
import {
    Filter,
    SelectInput,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';

import {TccOverrides} from '../constants/overrides_const';


export default (props) => {
    let filters = TccOverrides.autoCompleteFilters.map(name => (
        <ReferenceInput
            key={name}
            source={name}
            reference="services"
            filterToQuery={searchTerm => ({[`q?_${name}`]: searchTerm})}>
            <AutocompleteInput
                optionText={choice => choice? `${choice[name]}`: ''}
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

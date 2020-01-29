import React from 'react';
import {
    Filter,
    TextInput,
    AutocompleteInput,
    DateInput,
    ReferenceInput,
    SearchInput,
    SelectInput,
} from 'react-admin';
import {tccOverrides} from './overrides_const';

let filters = [];
let names = [];
export default (props) => {
    if (props.data) {
        let isDataAvail = Object.keys(props.data);

        if (isDataAvail.length) {
            let choices = {};

            let filters1 = Object.entries(props.data).map(([id, item]) => {
                Object.entries(item).map(([key, val]) => {
                    if (tccOverrides.columnNames.indexOf(key) !== -1) {
                        console.log('..item ', key, val);
                        if (choices[key]) {
                            let duplicate = choices[key].some(item => item.id === val);
                            if (duplicate) return;

                            choices[key].push({id: val, name: val});
                        } else {
                            choices[key] = [{id: val, name: val}];
                        }
                    console.log('...choices ', choices);
                    }
                });


                // return (<SelectInput
                //     key={name}
                //     source={name}
                //     choices={choices[name]}
                //     translateChoice={false}
                // />);
                // return (<AutocompleteInput key={name} source={name} choices={choices2[name]} optionText={name}
                //                            translateChoice={false}/>)
            });

            filters = tccOverrides.columnNames.map(name => (
                <SelectInput
                    key={name}
                    source={name}
                    choices={choices[name]}
                    translateChoice={false}
                />));

            console.log('...filtesr1 ', filters1);
        }

    }
    return (
        <Filter {...props}>
            {filters}
        </Filter>
    )
}
;

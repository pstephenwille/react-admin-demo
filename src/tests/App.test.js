import React from 'react';
  import App from '../App';


xdescribe('<Admin ', () => {
    test('renders learn react link', () => {
        const {getByText} = render(<App/>);
        const linkElement = getByText(/learn react/i);
        expect(linkElement).toBeInTheDocument();
    });
});

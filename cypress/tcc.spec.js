describe('Filters the Datagrid for alert_email [data.eng.alerts+qa1@climate.com]', () => {
    const ServicesPage = '/services';

    beforeEach(() => {
        cy.visit('/' + ServicesPage);
        cy.get('button[aria-label="Add filter"]').click()
            .get('[data-key="alert_email"]').click()
            .get('#alert_email').click();
    });

    it('Selects the 2nd email and displays it ', () => {

        cy.get('li div strong')
            .contains('data.eng.alerts+qa1@climate.com')
            .click({force: true})
            .then(item => {
                const selectedItemText = item.text();

                cy.get('table tbody tr').should(tr => {
                    expect(tr.length).to.eq(1);
                });

                cy.get('td.column-alert_email').should(td => {
                    expect(td[0].innerText).to.eq(selectedItemText)
                });
            });
    })

});

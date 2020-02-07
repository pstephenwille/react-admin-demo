describe('Filtering the Datagrid on alert_email for [data.eng.alerts+qa1@climate.com]', () => {
    const ServicesPage = '/services';

    beforeEach(() => {
        cy.visit('/' + ServicesPage);
        cy.get('button[aria-label="Add filter"]').click()
            .get('[data-key="alert_email"]').click()
            .get('#alert_email').click();
        cy.get('#downshift-0-item-2 strong')
            .contains('data.eng.alerts+qa1@climate.com')
            .click({force: true});
    });

    it('produces a single row', () => {
        cy.get('table tbody tr').should(tr => {
            expect(tr.length).to.eq(1);
        });
    });

    it('row contains the exact match', () => {
        cy.get('td.column-alert_email').should(td => {
            expect(td[0].innerText).to.eq('data.eng.alerts+qa1@climate.com')
        });
    });


});

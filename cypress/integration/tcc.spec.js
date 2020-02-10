describe('Filters the Datagrid', () => {
    const ServicesPage = '/services';

    beforeEach(() => {
        cy.visit('/' + ServicesPage);
    });

    it('Selecting multiple filters displays the correct item', () => {
        /* name */
        cy.get('button[aria-label="Add filter"]').click()
            .get('[data-key="name"]').click()
            .get('#name').click();
        cy.get('#name')
            .type('prometheus')
            .type('{downarrow}{downarrow}')
            .type('{enter}');

        /* team */
        cy.get('button[aria-label="Add filter"]').click()
            .get('[data-key="team"]').click()
            .get('#team').click();
        cy.get('#team')
            .type('sre')
            .type('{downarrow}{downarrow}')
            .type('{enter}');

        /* alert_email */
        cy.get('button[aria-label="Add filter"]').click()
            .get('[data-key="alert_email"]').click()
            .get('#alert_email').click();
        cy.get('#alert_email')
            .type('oe@climate.com')
            .wait(500)
            .type('{downarrow}{downarrow}')
            .type('{enter}');

        cy.get('#root main table tbody tr td span')
            .contains('prometheus-archive')
            .should('have.length', 1);
        cy.get('#root main table tbody tr td span')
            .contains('oe@climate.com')
            .should('have.length', 1);
        cy.get('#root main table tbody tr td span')
            .contains('production')
            .should('have.length', 1);
        cy.get('#root main table tbody tr td span')
            .contains('sre')
            .should('have.length', 1);
    });

    it('Adding a Filter initially displays only unique values', () => {
        /* team */
        cy.get('button[aria-label="Add filter"]').click()
            .get('[data-key="team"]').click()
            .get('#team').click();

        cy.get('#downshift-0-menu').then(teams => {
            let allTeamNames = {};
            teams.children('div').children('li').map((i, teamName) => {
                if (i === 0) return;
                const name = teamName.innerText;
                allTeamNames[name] = ++allTeamNames[name] || 1;
            });

            const hasDups = Object.entries(allTeamNames).some(([name, count]) => count > 1);

            expect(hasDups).to.be.false;
        });
    });

    it('Displays the filtered item from URL params', () => {
        cy.visit('http://localhost:3000/services#/services?filter=%7B%22name%22%3A118%2C%22team%22%3A12%2C%22alert_email%22%3A24%7D&order=ASC&page=1&perPage=10&sort=id');

        cy.get('#root main table tbody tr td span')
            .contains('prometheus-archive')
            .should('have.length', 1);
        cy.get('#root main table tbody tr td span')
            .contains('oe@climate.com')
            .should('have.length', 1);
        cy.get('#root main table tbody tr td span')
            .contains('production')
            .should('have.length', 1);
        cy.get('#root main table tbody tr td span')
            .contains('sre')
            .should('have.length', 1);

        });
});

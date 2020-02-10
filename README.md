# Web Template
### What is a web template?
It's a bare bones web app meant to be cloned and tailored, to get you up and running quickly.  Building front ends from this template is how we intend to ensure standards and uniformity  are maintained across TCC.

>This basic  [react-admin](https://marmelab.com/react-admin/Readme.html) (RA) app is scaffolded out with [create-react-app](https://marmelab.com/react-admin/Readme.html) (CRA).  CRA is Facebook's `cli` utility to generate `react` apps.  RA is a React framework that simplifies creating apps focused on displaying data.  Reading up on RA is essential to customizing this template.

### Usage
Simply clone, install, tailor, and deploy.
1. Clone the repo
1. CLI: `yarn` or `npm i`
1. Verify: 
    1. `yarn run test a`
1. Run the app: `yarn start`

Next you should see the app launch in your browser.

### Tailoring
You'll want to read up on `react-admin` and use their library components to display your data but first, here are some core files to be tailored to your use.
1. `src/constants/overrides_const.ts` - defines the url to fetch data from, as well as the fields to display and filter on.
1. `.evn.development` and `.env.production` - defines `REACT_APP_TCC_BASE_URL`, the host name for the environment.
    >You can hard code your back-end URL in the overrides file to develop against production data.  Otherwise it uses stubbed data from `json-server/data/tcc-data.json`
1. Following the [RA docs](https://marmelab.com/react-admin/Readme.html) you can add in components, routes, pages, etc.. to display your data.

### Testing with:
>The app uses [Jest](https://jestjs.io/) for unit tests and [Cypress](https://www.cypress.io/) for component and e2e tests.  



### - Jest
Tests live along side the components they test.  See `home/tests` for an example. 
To run the unit tests:
1. Jest: `yarn run test a`

### - Cypress
Cypress tests live in `cypress/integration`
To run the e2e tests:
1. Cypress 
    1. `yarn run cy:run` to run headless mode
    1. `yarn run cy:open` to launch in your browser 




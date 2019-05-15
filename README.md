# Okta + Carmax PoC

This PoC demonstrates a number of use-cases specified by Carmax

## Prerequisites

* This app runs on NodeJS/Express
* Uses handlebars for page layout/logic

## Selected Components/libraries

[@okta/okta-sdk-nodejs](https://github.com/okta/okta-sdk-nodejs): Node.js API Client for the Okta Platform API

[@okta/okta-auth-js](https://github.com/okta/okta-auth-js): The official js wrapper around Okta's auth API

## Use-cases

1.1.1	save car - light registration - phone

UI: Save for later->enter phone #
code: register.js

1.1.2	save car - light registration - email
UI: Save for later->enter email address
code: register.js

1.1.3	save car - light registration - google
UI: Save for later->google
code: register.js

1.1.4	alert me - full registration - email
UI: After light reg & authn, go to home page. click on "alert me" for a saved car. User will be prompted to enter fn, ln, password
code: index.js

1.2.1	saved cars are displayed to customer
UI: After light reg, click on Saved Cars
code: savedcars.js

1.4	Customer can delete their account
UI: After authentication, click on nav->customer deletes account
code: delete.js, delete-for-sure.js

2.1	pre-qual + consent
UI: in an authenticated state, click on "get prequalified!"
code: consent.js

3	“step up” to handle more restrictive authentication scenarios.
UI: in an authenticated state, click on "Step-up MFA", then click on "check my balance"
code: stepup.js
Note: this shows "on-demand" step-up initiated by the app, rather than step-up enforced by Okta policy. MFA enforced by Okta policy is the standard; this on-demand step up is meant to show step-up needed for a specific transaction.



const okta = require('@okta/okta-sdk-nodejs')
const OktaAuth = require('@okta/okta-auth-js');

const express = require('express')

const router = express.Router()

const client = new okta.Client({
    orgUrl: process.env.OKTA_ORG_URL,
    token: process.env.OKTA_TOKEN
})

const authClient = new OktaAuth({
    url: process.env.OKTA_ORG_URL
});

const phonefield = [{
    name: 'phoneNumber',
    label: 'Phone Number'
}]

const {
    ExpressOIDC
} = require('@okta/oidc-middleware')
const newOidc = new ExpressOIDC({
    issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    appBaseUrl: process.env.HOST_URL,

    redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
    scope: 'openid profile phone email appUpdateSms sharePreQualificationStatus'
})



router.get('/', (req, res) => {
    var oidc_redirect_uri = process.env.OKTA_ORG_URL + '/oauth2/default/v1/authorize?'
    oidc_redirect_uri += 'client_id=' + process.env.OKTA_CLIENT_ID
    oidc_redirect_uri += '&redirect_uri=' + process.env.HOST_URL
    oidc_redirect_uri += '&response_type=token&scope=openid+email+profile+appUpdateSms+sharePreQualificationStatus&state=somestate'
    oidc_redirect_uri += '&nonce=somenonce&prompt=consent'
    res.redirect(oidc_redirect_uri)
})

router.post('/challenge', async (req, res) => {
    console.log(req);
})

module.exports = router
const okta = require('@okta/okta-sdk-nodejs')
const OktaAuth = require('@okta/okta-auth-js')
const nJwt = require('njwt')

const express = require('express')

const router = express.Router()

const client = new okta.Client({
    orgUrl: process.env.OKTA_ORG_URL,
    token: process.env.OKTA_TOKEN
})

const authClient = new OktaAuth({
    url: process.env.OKTA_ORG_URL
});

const {
    ExpressOIDC
} = require('@okta/oidc-middleware')

const oidc = new ExpressOIDC({
    issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    appBaseUrl: process.env.HOST_URL,
    redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
    scope: 'openid profile phone email'
})

router.get('/', oidc.ensureAuthenticated(), (req, res) => {

    const {
        userContext
    } = req

    // use a real nonce in production
    var oidc_redirect_uri = process.env.OKTA_ORG_URL + '/oauth2/v1/authorize?'
    oidc_redirect_uri += 'client_id=' + process.env.OKTA_CLIENT_ID
    oidc_redirect_uri += '&redirect_uri=' + process.env.HOST_URL + '/delete_for_sure'
    oidc_redirect_uri += '&response_type=code&scope=openid+email+profile&state=somestate'
    oidc_redirect_uri += '&nonce=somenonce&prompt=none'

    if (userContext) {
        console.log(userContext.userinfo)
        console.log(userContext.userinfo)
        console.log(userContext.userinfo.savedCars)

        res.render('delete', {
            userContext,
            oidc_redirect_uri
        })
    } else {
        res.redirect('/')
    }
})

module.exports = router
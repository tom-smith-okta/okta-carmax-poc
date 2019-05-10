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

const { ExpressOIDC } = require('@okta/oidc-middleware')

const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: process.env.HOST_URL,
  redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
  scope: 'openid profile phone email'
})

router.get('/', oidc.ensureAuthenticated(), (req, res) => { 

    const { userContext } = req
    
    res.render('share-info', { userContext })

})

router.post('/', oidc.ensureAuthenticated(), (req, res) => { 

  res.send("got a post")

})

module.exports = router
// Endpoint to allow an Okta user to delete their grants
// this endpoint expects an authorization code from an
// OIDC redirect
const okta = require('@okta/okta-sdk-nodejs')
const OktaAuth = require('@okta/okta-auth-js')

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


router.post('/', oidc.ensureAuthenticated(), (req, res) => {
        const userContext = req.userContext
        const { body } = req
        var request = require("request");
          console.log("revoke grant >>>>>>>>>>>>>>>>>"+JSON.stringify(body.grantId))
          console.log("user Id >>>>>>>>>>>>>>>>>"+JSON.stringify(userContext))
          var options = {
            method: 'DELETE',
            url: process.env.OKTA_ORG_URL + '/api/v1/users/' + userContext.userinfo.sub + '/grants/'+body.grantId, 
            headers: {
              'cache-control': 'no-cache',
              Connection: 'keep-alive',
              'accept-encoding': 'gzip, deflate',
              Authorization: 'SSWS ' + process.env.OKTA_TOKEN,
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          };

          request(options, function (error, response, body) {
            if (error) {
              console.log(error)
              res.redirect('/')
            }
            
            else {
              if (response.statusCode === 200) {
                res.redirect('/consentMangement')
              }
              else {
                console.dir(response)
                res.redirect('/')
              }
            }
          });
        })
      
    



module.exports = router

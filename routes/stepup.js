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

// Take the user to the home page if they're already logged in
router.use('/', (req, res, next) => {
    if (!req.userContext) {
        return res.redirect('/')
    }

    next()
})

const fields = []

const { ExpressOIDC } = require('@okta/oidc-middleware')
const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.STEP_UP_CLIENT_ID,
  client_secret: process.env.STEP_UP_CLIENT_SECRET,
  appBaseUrl: process.env.HOST_URL,

  redirect_uri: `${process.env.HOST_URL}/stepup`,
  scope: 'openid profile phone email'
})

const index_img_url = process.env.INDEX_IMG_URL

router.get('/', oidc.ensureAuthenticated(), (req, res) => { 
    const { userContext } = req
    const tokenSet = req.userContext.tokens;

    /*************************************/

    var greeting_name = ""

    if (userContext.userinfo.given_name) {
        greeting_name = userContext.userinfo.given_name
    }
    else {
        greeting_name = userContext.userinfo.preferred_username
    }

    console.log("the name we are going to greet the user with is:")
    console.log(greeting_name)

    /*************************************/

    res.render('stepup', { greeting_name, userContext, fields, index_img_url})
})

router.post('/', async (req, res) => {
    const { body } = req
    const { userContext } = req
    console.log(userContext)
    // console.log(process.env)
    console.log(body)
    if (!body.id_token) {
        try {
            //client-secret of Okta app
            var signingKey = process.env.STEP_UP_CLIENT_SECRET

            //claims needed to do handoff
            var claims = {
                iss: process.env.STEP_UP_CLIENT_ID, //client_id
                aud: process.env.OKTA_ORG_URL,
                response_type: "id_token",
                response_mode: "form_post",
                client_id: process.env.STEP_UP_CLIENT_ID,
                redirect_uri: process.env.HOST_URL + process.env.STEP_UP_PATH,
                scope: "openid",
                acr_values: "urn:okta:app:mfa:attestation",
                login_hint: userContext.userinfo.preferred_username,
                nonce: "abc123", //don't use for production
                state: "123abc" //don't use for production
            }

            var jwt = nJwt.create(claims, signingKey);
            jwt.setExpiration(new Date().getTime() + (60 * 60 * 1000)); // One hour from now


            res.redirect(process.env.OKTA_ORG_URL + "/oauth2/v1/authorize?request=" + jwt)
        } catch ({ errorCauses }) {
            const errors = {}

            errorCauses.forEach(({ errorSummary }) => {
                const [, field, error] = /^(.+?): (.+)$/.exec(errorSummary)
                errors[field] = error
            })

            res.render('register', {
                errors,
                fields: fields.map(field => ({
                    ...field,
                    error: errors[field.name],
                    value: body[field.name]
                }))
            })
        }
    } else {
        const fields = [
            { name: 'none', label: 'Step-up', type: "text", value: "SUCCESS" }
        ]
        console.log(body.id_token)
        const payload = Buffer.from(body.id_token.split(".")[1], 'base64').toString()

        /*************************************/

        var greeting_name = ""

        if (userContext.userinfo.given_name) {
            greeting_name = userContext.userinfo.given_name
        }
        else {
            greeting_name = userContext.userinfo.preferred_username
        }

        console.log("the name we are going to greet the user with is:")
        console.log(greeting_name)

        /*************************************/

        console.log(payload)
        var stepup = {stepup: true}
        res.render('stepup', { greeting_name, userContext, fields, payload, stepup, index_img_url })
    }

})

module.exports = router
const express = require('express')
const router = express.Router()
const session = require('express-session')
const okta = require('@okta/okta-sdk-nodejs')

const client = new okta.Client({
	orgUrl: process.env.OKTA_ORG_URL,
	token: process.env.OKTA_TOKEN
})

const { ExpressOIDC } = require('@okta/oidc-middleware')

const oidc = new ExpressOIDC({
	issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
	client_id: process.env.OKTA_CLIENT_ID,
	client_secret: process.env.OKTA_CLIENT_SECRET,
	appBaseUrl: process.env.HOST_URL,
	redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
	scope: 'openid profile phone email'
})

const fields = [
	{ name: 'username', label: 'Phone Number or Email' }
]

const otpFields = [
	{ name: 'otpCode', label: 'sms code' }
]

router.get('/refresh', (req, res) => {
	req.logout()
	res.redirect("/savedcars")
})

router.get('/refreshConsent', (req, res) => {
	if (req.userContext) {
		req.logout()
	}
	res.redirect("/consent")
})

const index_img_url = process.env.INDEX_IMG_URL

var cars = {
	"73421": {title: "2021 Honda Accord", price: "$50,000.00", miles: "5K Miles" },
	"88435": {title: "2018 Honda Accord", price: "$20,000.00", miles: "5K Miles" },
	"12432": {title: "2019 Honda Sport", price: "$30,000.00", miles: "10K Miles" }
}

router.get('/', (req, res) => {

	console.log("the index route is being loaded.")

	if (req.userContext) {
		console.log("there is a user contenxt")
	}
	else {
		console.log("there is no user context")
	}

	const { userContext } = req

	if (userContext) {

		console.log(userContext)

		// extract and decode the claims from the id token
		const payload = Buffer.from(userContext.tokens.id_token.split(".")[1], 'base64').toString()

		console.log("the claims in the id token are:")
		console.log(payload)

		var greeting_name = ""

		if (userContext.userinfo.given_name) {
			greeting_name = userContext.userinfo.given_name
		}
		else {
			greeting_name = userContext.userinfo.preferred_username
		}

/*************************************/

		console.log("the name we are going to greet the user with is:")
		console.log(greeting_name)

		// if this is a phone-number-only user
		// set the phonePasswordless attribute to true
		if (userContext.userinfo.preferred_username.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {

			client.getUser(userContext.userinfo.preferred_username)
			.then(user => {
				user.profile.phonePasswordless = 'true'

				user.update().then(result => {

					console.log(result)

					res.render('index', { greeting_name, userContext, payload, cars, index_img_url})
					return
				})
			})
		}
		else {
			res.render('index', { greeting_name, userContext, payload, cars, index_img_url})
			return
		}
	}
	else
		var successUrl = process.env.HOST_URL + "/login"
		res.render('index', { greeting_name, userContext, fields, otpFields, cars, index_img_url, successUrl})
		return
})

module.exports = router

const okta = require('@okta/okta-sdk-nodejs')
const OktaAuth = require('@okta/okta-auth-js')
// const nJwt = require('njwt')

const express = require('express')

const request = require("request");

const router = express.Router()

const client = new okta.Client({
	orgUrl: process.env.OKTA_ORG_URL,
	token: process.env.OKTA_TOKEN
})

const authClient = new OktaAuth({
	url: process.env.OKTA_ORG_URL
});

router.get('/', (req, res) => {

	const { userContext } = req

	if (userContext) {

		var users = []

		console.log("here are the users")

		client.getGroup("00gjp1olmgw4vhBFf0h7")
		.then((response) => response.listUsers().each(user => {

			console.log(user)

			console.log("the user id is: " + user.id)

			users.push(user)

		})).then(() => res.render('admin', {
			userContext,
			users
		}))

		console.log(users);
		//res.render('admin', { userContext, users })
	} else {
		res.redirect('/')
	}
})

function has_grant(user_id, callback) {
	var options = {
		method: 'GET',
		url: process.env.OKTA_ORG_URL + '/api/v1/users/' + user_id + '/grants',
		headers: {
			'Cache-Control': 'no-cache',
			Authorization: 'SSWS ' + process.env.OKTA_TOKEN,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		}
	}

	request(options, function (error, response, body) {
		if (error) throw new Error(error)

		console.log(body)

		scopes = JSON.parse(body)

		for (i=0; i<scopes.length; i++) {
			if (scopes[i].scopeId === "scpkmrq6fijXqVBVy0h7") {
				console.log("****************************")
				console.log("found a share pre-qual grant")

				return callback(null, true)
			}
		}
		return callback(null, false)
	})
}

module.exports = router
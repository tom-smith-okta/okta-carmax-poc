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

// Take the user to the home page if they're already logged in
router.use('/', (req, res, next) => {
	if (req.userContext) {
		return res.redirect('/')
	}
	next()

})

const fields = [
		{ name: 'username', label: 'Phone Number or Email' }
]

const otpFields = [
	{ name: 'otpCode', label: 'sms code' }
]

const base_url = process.env.OKTA_ORG_URL
const login_url = process.env.HOST_URL + "/login"

router.get('/', (req, res) => {
		res.render('register', { base_url, fields, login_url, otpFields })
})

// const base_url = process.env.OKTA_ORG_URL
// const login_url = process.env.HOST_URL + "/login"

router.post('/', async (req, res) => {
	const { body } = req

	try {
		var email = body.username // can be either an emal adddres or a phone number 
		var groupId = process.env.EMAIL_REGISTER_GROUP_ID // put all of these users in the same group
		var profile = {
			login: body.username, // can be either an emal address or a phone number 
			email: email, // can be either an emal adddres or a phone number 
			passwordlessMode: true
		}

		if (body.savedCarId) {
			profile.savedCars = [body.savedCarId]
		}

		function generatePwd(length) {
			var result           = '';
			var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for (var i = 0; i < length; i++) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			return result;
		}

		var pwd = generatePwd(32)

		var email_or_phone = ""

		// if the username is actually a phone number, create an email address for the user
		// email address = {phone number} + fake domain
		if (body.username.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {

			email_or_phone = "phone"

			email = body.username + process.env.PHONE_REGISTER_USERNAME_DOMAIN

			// change the group id to be the phone group instead of the email group
			groupId = process.env.PHONE_REGISTER_GROUP_ID

			var profile = {
				login: body.username,
				email: email,
				mobilePhone: body.username,
				passwordlessMode: true
			}

			if (body.savedCarId) {
				profile.savedCars = [body.savedCarId]
			}
		}
		else {
			email_or_phone = "email"
		}

		if (email_or_phone === "phone") {
			await client.createUser({
				profile: profile,
				credentials: {
					password: {
						value: pwd
					}
				},
				groupIds: [
					groupId
				]
			})
		}
		else {
			await client.createUser({
				profile: profile,
				credentials: {
					password: {
							value: pwd
					}
				}
			})
		}

		authClient.signIn({
			username: body.username, // will be either email address or phone number
			password: pwd
		})
		.then(function(transaction) {
			console.log(transaction.data.sessionToken)

			// console.log(authClient)

			if (transaction.data.status === 'SUCCESS') {

				if (email_or_phone === "email") {

					client.getUser(email)
					.then(user => {
						console.log(user)

						user.addToGroup(process.env.EMAIL_REGISTER_GROUP_ID)
						.then(function() {
							console.log('User has been added to group')

							res.redirect(process.env.HOST_URL + "/register?sessionToken=" + transaction.data.sessionToken)

							return
						})
					})
				}
				else {
					res.redirect(process.env.HOST_URL + "/register?sessionToken=" + transaction.data.sessionToken)
				}
			}

			else if (transaction.status === 'MFA_ENROLL') {
				res.redirect(process.env.HOST_URL + "/register?stateToken=" + transaction.data.stateToken)
			}
			else {
				throw 'We cannot handle the ' + transaction.status + ' status';
			}
		})
		.fail(function(err) {
			console.error(err);
		})

			//res.redirect('/')
	}
	catch ({ errorCauses }) {
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
})

module.exports = router
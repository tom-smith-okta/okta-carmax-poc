require('dotenv').config()

const express = require('express')
const path = require('path')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static('public'))

app.use(require('express-session')({
	secret: process.env.APP_SECRET,
	resave: true,
	saveUninitialized: false
}))

const { ExpressOIDC } = require('@okta/oidc-middleware')

const oidc = new ExpressOIDC({
	issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
	client_id: process.env.OKTA_CLIENT_ID,
	client_secret: process.env.OKTA_CLIENT_SECRET,
	appBaseUrl: process.env.HOST_URL,
	redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
	scope: 'openid profile phone email'
})

app.use(oidc.router)

app.use('/admin', require('./routes/admin'))
app.use('/consent', require('./routes/consent'))
app.use('/consentmanagement', require('./routes/consentmanagement'))
app.use('/delete', require('./routes/delete'))
app.use('/delete_for_sure', require('./routes/delete_for_sure'))
app.use('/nav', require('./routes/nav'))
app.use('/refreshConsent', require('./routes/consent'))
app.use('/register', require('./routes/register'))
app.use('/revokeGrant', require('./routes/revokeGrant'))
app.use('/savedcars', require('./routes/savedcars'))
app.use('/share-info', require('./routes/share-info'))
app.use('/update', require('./routes/update'))

app.use(process.env.STEP_UP_PATH, require('./routes/stepup'))

app.get('/logout', (req, res) => {
	if (req.userContext) {
		const idToken = req.userContext.tokens.id_token
		const to = encodeURI(process.env.HOST_URL)+"/logout"
		const params = `id_token_hint=${idToken}&post_logout_redirect_uri=${to}`
		req.logout()
		res.redirect(process.env.OKTA_ORG_URL + "/login/signout?fromURI=" + process.env.HOST_URL);
	} else {
		res.redirect('/')
	}
})

app.use('/', require('./routes/index'))

const port = process.env.PORT 
app.listen(port, () => console.log(`App listening on port ${port}`))

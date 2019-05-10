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
    // The URL for your Okta organization
    url: process.env.OKTA_ORG_URL
});

router.get('/', (req, res) => {

    const {
        userContext
    } = req

    if (userContext) {

        //var grants = [{scope:{title:"app status sms"}},{scope:{title:"app status sms"}}]
        //client.getGroup("00gjp1olmgw4vhBFf0h7").then((response) => response.listUsers().each(user => {  users.push(user)})).then(() =>   res.render('admin', { userContext, users }));

        var request = require("request");
        var userId = userContext.userinfo.sub
        var options = {
            method: 'GET',
            url: 'https://carmax-poc.oktapreview.com/api/v1/users/' + userId + '/grants',
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: 'SSWS ' + process.env.OKTA_TOKEN,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        };
        request(options, function(error, response, body) {
            if (error) console.log(error)
            console.log("HEEEEEERE")
            var grants = JSON.parse(body)
            console.log(grants)
            res.render('consentmanagement', {
                userContext,
                grants
            })
            console.log(body);
        });
        //res.render('admin', { userContext, grants })
    } else {
        res.redirect('/')
    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const okta = require('@okta/okta-sdk-nodejs');

const client = new okta.Client({
  orgUrl: 'https://carmax-poc.oktapreview.com',
  token: process.env.OKTA_TOKEN   // Obtained from Developer Dashboard
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
      console.log(userContext)
      client.getUser(userContext.userinfo.preferred_username)
        .then(user => {
        var userLogin = user.profile.login
        console.log("HERE")
        console.log(req.body)
        for (var key in req.body) {
                  if (req.body.hasOwnProperty(key)) {
              if(key != "password" && key != "updateCarId") {
                user.profile[key] = req.body[key]
              } else if(key == "updateCarId") {
                if(user.profile.savedCars && req.body["updateCarId"]) {
                  var cars = user.profile.savedCars
                  cars.push(req.body["updateCarId"])
                  user.profile["savedCars"] = cars
                } else if(req.body["updateCarId"]) {
                  console.log("######################################")
                  console.log(user.profile)
                  user.profile["savedCars"] = [req.body["updateCarId"]]
                  console.log(user.profile)
                  console.log("######################################")
                }
              }
          }
        }
        user.update().then(result => {
        console.log(result)
        if(req.body.password) {
          var request = require("request");
          var options = { method: 'PUT',
            url: 'https://carmax-poc.oktapreview.com/api/v1/users/' + userLogin,
            headers: 
             { 'cache-control': 'no-cache',
               authorization: "SSWS " + process.env.OKTA_TOKEN,
               'content-type': 'application/json',
               accept: 'application/json' },
            body: { credentials: { password: { value: req.body.password } } },
            json: true };
          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(response)
            res.redirect("/")
          });
        } else {
          res.redirect("/")
        }
        });
      })
})

module.exports = router
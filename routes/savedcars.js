const okta = require('@okta/okta-sdk-nodejs')
const OktaAuth = require('@okta/okta-auth-js')
const nJwt = require('njwt')

const express = require('express')

const router = express.Router()

const client = new okta.Client({
  orgUrl: process.env.OKTA_ORG_URL,
  token: process.env.OKTA_TOKEN
})

var cars = {
  "73421": {title: "2021 Honda Accord", price: "$50,000.00", miles: "5K Miles" },
  "88435": {title: "2018 Honda Accord", price: "$20,000.00", miles: "5K Miles" },
  "12432": {title: "2019 Honda Sport", price: "$30,000.00", miles: "10K Miles" }
}

const authClient = new OktaAuth({
  url: process.env.OKTA_ORG_URL
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

router.get('/', oidc.ensureAuthenticated(), (req, res) => { 
    console.log(req)
  
    const { userContext } = req
    
    if(userContext)
    {
      console.log(userContext.userinfo)
      console.log(userContext.userinfo)
      console.log(userContext.userinfo.savedCars)
      var savedCars = []
      if(userContext.userinfo.savedCars) {
        var savedCarsLength = userContext.userinfo.savedCars.length;
        for (var i = 0; i < savedCarsLength; i++) {
            console.log(userContext.userinfo.savedCars[i]);
          var carId = userContext.userinfo.savedCars[i]
            savedCars.push(cars[carId])
        }
        console.log(savedCars)
      }
      const payload = Buffer.from(userContext.tokens.id_token.split(".")[1], 'base64').toString()
      var index_img_url = process.env.INDEX_IMG_URL

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

      res.render('savedcars', { greeting_name, userContext, payload, index_img_url, savedcars: savedCars })
      } else {
      res.redirect('/')
      }
})

// Take the user to the home page if they're already logged in
// router.use('/', (req, res, next) => {
//     if (!req.userContext) {
//         return res.redirect('/')
//     }

//     next()
// })

module.exports = router
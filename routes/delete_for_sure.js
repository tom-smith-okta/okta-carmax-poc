// Endpoint to allow an Okta user to delete themselves
// this endpoint expects an authorization code from an
// OIDC redirect

const express = require('express')

const request = require('request');

const router = express.Router()

router.get('/', (req, res) => {
  
    let authz_code = req.query.code;

    if(authz_code) {
      var client_id = process.env.OKTA_CLIENT_ID
      var client_secret = process.env.OKTA_CLIENT_SECRET
      var authz_string = client_id + ":" + client_secret
      
      var encodedData = Buffer.from(authz_string).toString('base64')

      var options = {
        method: 'POST',
        url: process.env.OKTA_ORG_URL + '/oauth2/v1/token',
        headers: {
          'cache-control': 'no-cache',
           Connection: 'keep-alive',
           'accept-encoding': 'gzip, deflate',
           'content-type': 'application/x-www-form-urlencoded',
           Authorization: 'Basic ' + encodedData,
           Accept: 'application/json'
        },
        form: {
          grant_type: 'authorization_code',
          redirect_uri: process.env.HOST_URL + '/delete_for_sure',
          code: authz_code
        }
      };

      request(options, function (error, response, body) {
        if (error) {
          console.dir(error)
          res.redirect('/')
        }
        else {
          
          var obj = JSON.parse(body)
          
          var jwt_fields = obj.id_token.split(".")
          
          var encoded_claims = jwt_fields[1]
          
          var claims = Buffer.from(encoded_claims, 'base64').toString('ascii');
          
          obj = JSON.parse(claims)
          
          var sub = obj.sub

          var options = {
            method: 'POST',
            url: process.env.OKTA_ORG_URL + '/api/v1/users/' + sub + '/lifecycle/deactivate', 
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
                res.redirect('/logout')
              }
              else {
                console.dir(response)
                res.redirect('/')
              }
            }
          });
        }
      })
    }
})

module.exports = router

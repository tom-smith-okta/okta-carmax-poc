const express = require('express')
const router = express.Router()
const okta = require('@okta/okta-sdk-nodejs');

const client = new okta.Client({
  orgUrl: 'https://carmax-poc.oktapreview.com',
  token: process.env.OKTA_TOKEN   // Obtained from Developer Dashboard
});

router.get('/', (req, res) => {
    
  var links = []
  
  links[0] = {}
  
  links[0]["name"] = "customer deletes account"
  links[0]["uri"] = "/delete"
  
  links[1] = {}

  links[1]["name"] = "family sharing"
  links[1]["uri"] = "/share-info"
  
  res.render('nav', { links })

})

module.exports = router
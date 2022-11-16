var express = require('express');
var router = express.Router();
require('dotenv').config()
const {v4: uuidv4} = require('uuid')

/* GET home page. */
router.get('/:courseID', function(req, res, next) {
    
    //authenticate with Schoology
    var schoologyAPIOptionsGet = {
        "method": "get",
        "headers": {
          "Accept": "application/json",
          "Authorization": `OAuth realm="Schoology API",oauth_consumer_key="${process.env.oath_consumer_key}",oauth_signature_method="PLAINTEXT",oauth_token="",oauth_timestamp="${parseInt((new Date().getTime()) / 1000)}",oauth_nonce="${uuidv4()}",oauth_version="1.0",oauth_signature="${oauth_signature}"`
        },
        "muteHttpExceptions": false
      }
    //use the route
  
    res.render('index', { title: 'Express' });
});

module.exports = router;

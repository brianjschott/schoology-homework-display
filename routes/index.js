var express = require('express');
var router = express.Router();
require('dotenv').config()
const {v4: uuidv4} = require('uuid')
const https = require('node:https')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/course/:courseID', function(req, res, next) {
  var data = []

    //authenticate with Schoology and send GET request via HTTPS
    https.get({
        port: 443,
        host: 'api.schoology.com',
        path: `/v1/sections/${req.params.courseID}/events`,
        headers: {
            "Accept":"application/json",
            "Authorization": `OAuth realm="Schoology API",oauth_consumer_key="${process.env.oauth_consumer_key}",oauth_signature_method="PLAINTEXT",oauth_token="",oauth_timestamp="${parseInt((new Date().getTime()) / 1000)}",oauth_nonce="${uuidv4()}",oauth_version="1.0",oauth_signature="${process.env.oauth_signature}"`
        }
    }, (schoologyResponse) => {
      schoologyResponse.setEncoding('utf-8')
        console.log(schoologyResponse.statusCode)
        console.log(schoologyResponse.headers)
        console.log(schoologyResponse.statusMessage)

        schoologyResponse.on('data', (d) => {
          data.push(d)
        }).on('end', () => {
          parsedData = JSON.parse(data.join())
          console.log(parsedData)
          res.render('index', { title: parsedData });
        })

    }).on("error", (e) => {
      console.log(e)
    })

});

module.exports = router;


module.exports = router;

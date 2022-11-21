var express = require('express');
var router = express.Router();
require('dotenv').config()
const {v4: uuidv4} = require('uuid')
const https = require('node:https');
const { callbackify } = require('node:util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/course/:courseID', function(req, res, next) {
  var parsedData = getAllEventsForCourse(req.params.courseID, () => {
    res.render('index', { courseList: parsedData });
  });
  //console.log(parsedData)
  //authenticate with Schoology and send GET request via HTTPS

});

//returns parsed JSON object at a given path
function makeSchoologyRequest(path) {
  var data = []
   https.get({
    port: 443,
    host: 'api.schoology.com',
    path: path,
    headers: {
        "Accept":"application/json",
        "Authorization": `OAuth realm="Schoology API",oauth_consumer_key="${process.env.oauth_consumer_key}",oauth_signature_method="PLAINTEXT",oauth_token="",oauth_timestamp="${parseInt((new Date().getTime()) / 1000)}",oauth_nonce="${uuidv4()}",oauth_version="1.0",oauth_signature="${process.env.oauth_signature}%26"`
    }
  }, (schoologyResponse) => {
    schoologyResponse.setEncoding('utf-8')
    
    //node gets data as a series of chunks. piece them together...
    schoologyResponse.on('data', (d) => {
      data.push(d)
    })
    schoologyResponse.on('end', () => {
      data = data.join()
      console.log(data)
      //then join the entire array as a big string, then parse it as JSON
      return(data)
    })
  }).on("error", (e) => {
    console.log("ERROR")
  })

  
}

//returns array of event objects
async function getAllEventsForCourse(courseID) {
  var events = []
  var path = `/v1/sections/${courseID}/events`
  await makeSchoologyRequest(path, (response) => {
    console.log(response)
    console.log("CALLBACK ACTIVATED")
    events.concat(response["event"])
    // while (response["links"]["next"]) {
    
    //   response = makeSchoologyRequest(request["links"]["next"])
  
    //   events.concat(response["event"])
    // }
    return events
  })

}


module.exports = router;
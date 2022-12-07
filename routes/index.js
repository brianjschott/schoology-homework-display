var express = require('express');
var router = express.Router();
require('dotenv').config()
const {v4: uuidv4} = require('uuid')
const https = require('node:https');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/course/:courseID',  async function(req, res, next) {
    await getAllEventsForCourse(req.params.courseID).then(parsedData => {
    console.log("parsed data is ", parsedData)
    res.render('coursepage', { courseList: parsedData });
  });
  //console.log(parsedData)
  //authenticate with Schoology and send GET request via HTTPS

});

//returns parsed JSON object at a given path
async function makeSchoologyRequest(path) {
  var data = []

  return new Promise(resolve => {
    https.get({
      port: 443,
      host: 'api.schoology.com',
      path: path,
      headers: {
        "Accept": "application/json",
        "Authorization": `OAuth realm="Schoology API",oauth_consumer_key="${process.env.oauth_consumer_key}",oauth_signature_method="PLAINTEXT",oauth_token="",oauth_timestamp="${parseInt((new Date().getTime()) / 1000)}",oauth_nonce="${uuidv4()}",oauth_version="1.0",oauth_signature="${process.env.oauth_signature}%26"`
      }
    }, (schoologyResponse) => {
      schoologyResponse.setEncoding('utf-8');
      console.log("Response received");
      //node gets data as a series of chunks. piece them together...
      schoologyResponse.on('data', (d) => {
        data.push(d);
      });
      schoologyResponse.on('end', () => {
        data = data.join();
        console.log("Data assembled", data);
        //then join the entire array as a big string, then parse it as JSON
        resolve(data);
      });
    }).on("error", (e) => {
      console.log("ERROR");
      resolve("ERROR")
    })
  })  
}

//returns array of event objects
//loops and makes repeated API calls to ensure it gets every event
async function getAllEventsForCourse(courseID) {
  var eventsList = []
  var response
  var path = `/v1/sections/${courseID}/events`
  await makeSchoologyRequest(path).then(r => {
    response = JSON.parse(r)
    console.log("Events is ", response["event"])
    eventsList = response["event"] 
  })
  //adds on subsequent event pages
  while (response["links"]["next"]) {
    console.log("next link is " , response["links"]["next"])
    await makeSchoologyRequest(response["links"]["next"]).then(r => {
      response = JSON.parse(r)
      eventsList.concat(response["event"])
    })
  }

  return eventsList

}


module.exports = router;
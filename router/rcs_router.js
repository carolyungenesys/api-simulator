var express = require('express');
var fs=require('fs');
var app = express();
var path='media';
var winston = require('winston');
var functions = require('./functions.js');

//This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
app.get('/rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3.bin', functions.auth, function (req, res) {
  var _ccid = req.params.ccid;
  var _rec_id = req.params.id;
  var _media_id = req.params.medianame;
  functions.getMediaPath('voice', _rec_id, _media_id, req, res);
  logger.info("RCS",worker_id,": Get a request to download encrypted call recording ",_media_id," from ccid ",_ccid,", recording id ",_rec_id);
  });

//This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
app.get('/rcs/recordings/:id/play/:medianame.mp3.bin', functions.auth,  function (req, res) {
  var _rec_id = req.params.id;
  var _media_id = req.params.medianame;
  functions.getMediaPath('voice', _rec_id, _media_id, req, res);
  logger.info("RCS",worker_id,": Get a request to download encrypted call recording ",_media_id," recording id ",_rec_id);
});

//This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp4
app.get('/rcs/contact-centers/:ccid/user-screen-recordings/:id/play/:medianame.mp4', functions.auth,  function (req, res) {
  var _ccid = req.params.ccid;
  var _rec_id = req.params.id;
  var _media_id = req.params.medianame;
  functions.getMediaPath('screen', _rec_id, _media_id, req, res);
  logger.info("RCS",worker_id,": Get a request to download screen recording ",_media_id," from ccid ",_ccid,", recording id ",_rec_id);
  })

app.get('/rcs/screen-recordings/:id/content/:medianame.mp4', functions.auth, function (req, res) {
  var _rec_id = req.params.id;
  var _media_id = req.params.medianame;
  functions.getMediaPath('screen', _rec_id, _media_id, req, res);
  logger.info("RCS",worker_id,": Get a request to download screen recording ",_media_id,".mp4 , recording id ",_rec_id);
});

app.get('/rcs/recordings/:id/play/:medianame.mp3', functions.auth,  function (req, res) {
  var _rec_id = req.params.id;
  var _media_id = req.params.medianame;
  functions.getMediaPath('voice', _rec_id, _media_id, req, res);
  logger.info("RCS",worker_id,": Get a request to download encrypted call recording ",_media_id,'.mp3'," recording id ",_rec_id);
});


//Get /, return 503
app.get('/',function(req, res){
  res.status(404).send("404!!Page not found!!");
  logger.debug("RCS",worker_id,": A quest from "+req.ip);
});

module.exports = app;
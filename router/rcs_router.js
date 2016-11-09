var express = require('express');
var fs=require('fs');
var app = express();
var path='media';
var cluster=require('cluster');
var numCPUs=require('os').cpus().length;
//var numCPUs=2;
var winston = require('winston');
var functions = require('./functions.js');
  /*
  //fork process
  if (cluster.isMaster) {
   numCPUs=(numCPUs-2)>0?numCPUs-2:numCPUs;
   for (var i = 0; i < numCPUs; i++){
     cluster.fork();
   }

   cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
  }
  else{*/
    // logger.info("Worker ",cluster.worker.id,"is running");
    //logger.info("Worker ",cluster.worker.id," is running");

  //This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
  app.get('/rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3.bin', function (req, res) {
    var _ccid = req.params.ccid;
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    functions.getMediaPath('voice', _rec_id, _media_id, req, res);
    logger.info("RCS: Get a request to download encrypted call recording ",_media_id," from ccid ",_ccid,", recording id ",_rec_id);
    });

  //This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
  app.get('/rcs/recordings/:id/play/:medianame.mp3.bin', function (req, res) {
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    functions.getMediaPath('voice', _rec_id, _media_id, req, res);
    logger.info("RCS: Get a request to download encrypted call recording ",_media_id," recording id ",_rec_id);
  });

  //This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp4
  app.get('/rcs/contact-centers/:ccid/user-screen-recordings/:id/play/:medianame.mp4', function (req, res) {
    var _ccid = req.params.ccid;
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    functions.getMediaPath('screen', _rec_id, _media_id, req, res);
    logger.info("RCS: Get a request to download screen recording ",_media_id," from ccid ",_ccid,", recording id ",_rec_id);
    })

  app.get('/rcs/screen-recordings/:id/content/:medianame.mp4', function (req, res) {
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    functions.getMediaPath('screen', _rec_id, _media_id, req, res);
    logger.info("RCS: Get a request to download screen recording ",_media_id,".mp4 , recording id ",_rec_id);
  });

  app.get('/rcs/recordings/:id/play/:medianame.mp3', function (req, res) {
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    functions.getMediaPath('voice', _rec_id, _media_id, req, res);
    logger.info("RCS: Get a request to download encrypted call recording ",_media_id,'.mp3'," recording id ",_rec_id);
  });


  //Get /, return 503
  app.get('/',function(req, res){
    res.status(404).send("404!!Page not found!!");
    logger.debug("RCS: A quest from "+req.ip);
  });

//}

module.exports = app;

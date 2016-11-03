  var express = require('express');
  var fs=require('fs');
  var app = express();
  var path='media';
  var cluster=require('cluster');
  var numCPUs=require('os').cpus().length;
  //var numCPUs=2;
  var winston = require('winston');

  function getCaseIndex(case_id){
    for (var i=0; i<config.length; i++){
      if (case_id == config[i]['case_id']){
        return i;
        break;
      }
    }
    return null;
  }

  function getMediaIndex(index,media_id){
    for (var i=0; i<config[index]['voice'].length; i++){
      if (media_id == config[index]['voice'][i]['mediaID']){
        return i;
        break;
      }
    }
    return null;
  }
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
    var _case_index = getCaseIndex(_rec_id);
    if (_case_index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      var _media_index = getMediaIndex(_case_index, _media_id);
      if (_media_index == null){
        res.status(404).send("fail to find corresponding media id for test case in config file!");
      }else{
        var _file_path = config[_case_index]['voice'][_media_index]['mediaPath'];
        var mp3 = new Buffer(fs.readFileSync(_file_path));
        res.status(200).send(mp3);
      }
    }
    logger.info("Get a request to download encrypted call recording ",_media_id," from ccid ",_ccid,", recording id ",_rec_id);
    });

  //This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
  app.get('/rcs/recordings/:id/play/:medianame.mp3.bin', function (req, res) {
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    var _case_index = getCaseIndex(_rec_id);
    if (_case_index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      var _media_index = getMediaIndex(_case_index, _media_id);
      if (_media_index == null){
        res.status(404).send("fail to find corresponding media id for test case in config file!");
      }else{
        var _file_path = config[_case_index]['voice'][_media_index]['mediaPath'];
        var mp3 = new Buffer(fs.readFileSync(_file_path));
        res.status(200).send(mp3);
      }
    }
    logger.info("Get a request to download encrypted call recording ",_media_id," recording id ",_rec_id);
  });

  //This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp4
  app.get('/rcs/contact-centers/:ccid/user-screen-recordings/:id/play/:medianame.mp4', function (req, res) {
    var _ccid = req.params.ccid;
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    var _case_index = getCaseIndex(_rec_id);
    if (_case_index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      var _media_index = getMediaIndex(_case_index, _media_id);
      if (_media_index == null){
        res.status(404).send("fail to find corresponding media id for test case in config file!");
      }else{
        var _file_path = config[_case_index]['voice'][_media_index]['mediaPath'];
        var mp4 = new Buffer(fs.readFileSync(_file_path));
        res.status(200).send(mp4);
      }
    }
    logger.info("Get a request to download screen recording ",_media_id," from ccid ",_ccid,", recording id ",_rec_id);
    })

  app.get('/rcs/screen-recordings/:id/content/:medianame.mp4', function (req, res) {
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    var _case_index = getCaseIndex(_rec_id);
    if (_case_index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      var _media_index = getMediaIndex(_case_index, _media_id);
      if (_media_index == null){
        res.status(404).send("fail to find corresponding media id for test case in config file!");
      }else{
        var _file_path = config[_case_index]['voice'][_media_index]['mediaPath'];
        var mp4 = new Buffer(fs.readFileSync(_file_path));
        res.status(200).send(mp4);
      }
    }
    logger.info("Get a request to download screen recording ",_media_id,", recording id ",_rec_id);
  });

  app.get('/rcs/recordings/:id/play/:medianame.mp3', function (req, res) {
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    var _case_index = getCaseIndex(_rec_id);
    if (_case_index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      var _media_index = getMediaIndex(_case_index, _media_id);
      if (_media_index == null){
        res.status(404).send("fail to find corresponding media id for test case in config file!");
      }else{
        var _file_path = config[_case_index]['voice'][_media_index]['mediaPath'];
        var mp3 = new Buffer(fs.readFileSync(_file_path));
        res.status(200).send(mp3);
      }
    }
    logger.info("Get a request to download nonencrypted call recording ",_media_id," recording id ",_rec_id);
  });


  //Get /, return 503
  app.get('/',function(req, res){
    res.status(404).send("404!!Page not found!!");
    logger.debug("A quest from "+req.ip);
  });

//}

  module.exports = app;
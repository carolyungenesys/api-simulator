var express = require('express');
var fs=require('fs');
var app = express();
var path='media';
var cluster=require('cluster');
var numCPUs=require('os').cpus().length;
//var numCPUs=2;
var winston = require('winston');
var target_mp3_data=new Buffer(fs.readFileSync(path + "/target.mp3"));
//create log folder if not existed;
var log_dir="./logs";
if(!fs.existsSync(log_dir)){
  fs.mkdirSync(log_dir);
}

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
else{
  var logger = new winston.Logger({
    //level: 'debug',
    transports: [
      new (winston.transports.Console)({colorize:true}),
      //new (winston.transports.File)({
      //                                filename:'./logs/standard.log',
      //                                handleExceptions:true,
      //                                colorize: true
      //                              }),
      new (require('winston-daily-rotate-file'))({
						level:'debug',
						datePattern:'HH_mm_dd-MM-yyyy_',
						prepend:true,
						timestamp: function() { return (new Date()).getTime();},
						filename:'./logs/rcs_all-logs.log'
						})
    ],
    exitOnError:false
  }); 
  // logger.info("Worker ",cluster.worker.id,"is running");
  logger.info("Worker ",cluster.worker.id," is running");

//This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
  app.get('/rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3.bin', function (req, res) {
  var _ccid = req.params.ccid;
  var _id = req.params.id;
  var _media_name = req.params.medianame + ".mp3";
  var file_path = path + "/target.mp3";
  logger.debug("A quest from "+req.ip);
  logger.info("Worker ",cluster.worker.id," Get a request to download file from ccid ",_ccid,", media id ",_id," and media file ",_media_name);
  //res.download(file_path,_media_name,function(err){
  //  if(err){
  //    logger.error("Fail to send media file %s with err %s",_media_name,err);
  // }
  //})
  res.type('mp3');
  res.status(200).send(target_mp3_data);
});

//This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp3
  app.get('/rcs/recordings/:id/play/:medianame.mp3.bin', function (req, res) {
  var _id = req.params.id;
  var _media_name = req.params.medianame + ".mp3";
  var file_path = path + "/target.mp3";
  logger.debug("A quest from "+req.ip);
  logger.info("Worker ",cluster.worker.id," Get a request to download file, media id ",_id," and media file ",_media_name);
  //res.download(file_path,_media_name,function(err){
  //  if(err){
  //    logger.error("Fail to send media file %s with err %s",_media_name,err);
  // }
  //})
  res.type('mp3');
  res.status(200).send(target_mp3_data);
});




//This method provide service for GET /rcs/contact-centers/:ccid/user-recordings/:id/play/:medianame.mp4
  app.get('/rcs/contact-centers/:ccid/user-screen-recordings/:id/play/:medianame.mp4', function (req, res) {
    var _ccid = req.params.ccid;
    var _id = req.params.id;
    var _media_name = req.params.medianame + ".mp4";
    var file_path = path + "/target.mp4";
    logger.debug("A quest from "+req.ip);
    logger.info("Worker ",cluster.worker.id," get a request to download file from ccid ",_ccid,", media id ",_id," and media file ",_media_name);
    res.download(file_path,_media_name,function(err){
    if(err){
      logger.error("Fail to send media file %s with err %s",_media_name,err);
    }
    });
  })

  app.get('/rcs/screen-recordings/:id/content/:medianame.mp4', function (req, res) {
    var _id = req.params.id;
    var _media_name = req.params.medianame + ".mp4";
    var file_path = path + "/target.mp4";
    logger.debug("A quest from "+req.ip);
    logger.info("Worker ",cluster.worker.id," Get a request to download file with media id ",_id," and media file ",_media_name);
    res.download(file_path,_media_name,function(err){
    if(err){
      logger.error("Fail to send media file %s with err %s",_media_name,err);
    }
    });
  });

  app.get('/rcs/recordings/:id/play/:medianame.mp3', function (req, res) {
    var _id = req.params.id;
    var _media_name = req.params.medianame + ".mp3";
    var file_path = path + "/target.mp3";
    logger.debug("A quest from "+req.ip);
    logger.info("Worker ",cluster.worker.id," Get a request to download file with media id ",_id," and media file ",_media_name);
    res.download(file_path,_media_name,function(err){
    if(err){
      logger.error("Fail to send media file %s with err %s",_media_name,err);
    }
    });
  });


  //Get /, return 503
  app.get('/',function(req, res){
    res.status(404).send("404!!Page not found!!");
    logger.debug("A quest from "+req.ip);
  });



  module.exports = app;
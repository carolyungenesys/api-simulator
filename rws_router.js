var express = require('express');
var fs=require('fs');
var app = express();
var path='./media';
var cluster=require('cluster');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var uuid = require('uuid');
var numCPUs=require('os').cpus().length;
//var numCPUs=2;
var winston = require('winston');
var config = JSON.parse(fs.readFileSync("./config.json"));

//var config = JSON.parse(fs.readFileSync("./config.json"));
//create log folder if not existed;
var log_dir="./logs";
if(!fs.existsSync(log_dir)){
  fs.mkdirSync(log_dir);
}

function getCaseIndex(case_id){
  for (var i=0; i<config.length; i++){
    if (case_id == config[i]['case_id']){
      return i;
      break;
    }
  }
}
function getMediaIndex(index,media_id){
  for (var i=0; i<config[index]['voice'].length; i++){
    if (case_id == config[index]['voice'][i]['mediaID']){
      return i;
      break;
    }
  }
}
  //fork process
  /*
  if (cluster.isMaster) {
    numCPUs=(numCPUs-2)>0?numCPUs-2:numCPUs;
    for (var i = 0; i < numCPUs; i++){
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    });
  }else{
    */
    var logger = new winston.Logger({
      transports: [
      new (winston.transports.Console)({colorize:true}),
      //new (winston.transports.File)({
      //                                filename:'./logs/standard.log',
      //                                handleExceptions:true,
      //                                colorize: true
      //                              }),
    new (require('winston-daily-rotate-file'))({
      level:'debug',
      datePattern:'HH_mm_dd_MM_yyyy_',
      prepend:true,
      timestamp: function() { return (new Date()).getTime();},
      filename:'./logs/rws_all-logs.log'
    })
    ],
    exitOnError:false
  }); 
  // logger.info("Worker ",cluster.worker.id,"is running");
  //logger.info("Worker ",cluster.worker.id," is running");
  

  //get /api/v2/ops/contact-centers/:ccid/recordings/:rec_id, return json
  app.get('/api/v2/ops/contact-centers/:ccid/recordings/:rec_id', function (req, res){
  	var _rec_id = req.params.rec_id;
  	var _id = req.params.ccid;
    var _uuid;
    
    var callRecording={"statusCode":0,"recording":{"callerPhoneNumber":"555001",
    "dialedPhoneNumber":"10001","mediaFiles":[],"eventHistory":[],"callType":"Inbound",
    "region":"region1"}};
    var index = getCaseIndex(_rec_id);

    callRecording['recording']['id']=_rec_id;
    callRecording['recording']['startTime']=config[index]['startTime'];
    callRecording['recording']['stopTime']=config[index]['stopTime'];
    for (var i=0; i<config[index]['voice'].length; i++){
      _uuid = uuid.v4();
      config[index]['voice'][i]['mediaID']=_uuid;
      callRecording['recording']['mediaFiles'][i]={};
      callRecording['recording']['mediaFiles'][i]['mediaUri']="http://"+req.hostname+":8080/api/v2/ops/contact-centers/"+_id+"/recordings/"+_rec_id+"/play/"+_uuid+".mp3";
      callRecording['recording']['mediaFiles'][i]['mediaPath']="/ops/contact-centers/"+_id+"/recordings/"+_rec_id+"/play/"+_uuid+".mp3";
      callRecording['recording']['mediaFiles'][i]['startTime']=config[index]['voice'][i]['startTime'];
      callRecording['recording']['mediaFiles'][i]['stopTime']=config[index]['voice'][i]['stopTime'];
      callRecording['recording']['mediaFiles'][i]['callUUID']=_uuid;
      callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']={};
      callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['storage']="webDAV";
      if (config[index]['voice'][i]['encryption']=='ture'){
        callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['path']="http://10.12.0.132/recordings/voice/"+_uuid+".mp3.bin";
        callRecording['recording']['mediaFiles'][i]['mediaId']=_uuid+"_Voice_Rec.mp3";
        callRecording['recording']['mediaFiles'][i]['pkcs7']='-----BEGIN PKCS7-----\nMIIBNQYJKoZIhvcNAQcDoIIBJjCCASICAQAxgfAwge0CAQAwVjBRMQswCQYDVQQGEwJVUzELMAkG\nA1UECAwCQ0ExEjAQBgNVBAcMCURhbHkgQ2l0eTEQMA4GA1UECgwHR2VuZXN5czEPMA0GA1UEAwwG\nZ2lyX3FhAgEKMA0GCSqGSIb3DQEBAQUABIGAsYZ1QVw3dmeTRz1QwS7mbj1bffGQznP+9wjAf7TQ\nALoeolF1ctmm+xXOvXdpuUHfnmTqeJXF9Ov2sQfIG3kXr4nuY87kMpiFIlqHQfQ4G0taMUs6KDff\nI/IYEx0wX/VloM6uN7Q564xDAffA8V4HnBXgxm8B2zm3aQrXMhttMjUwKgYJKoZIhvcNAQcBMB0G\nCWCGSAFlAwQBKgQQ5JL1BpqK71JXStm+mbnHiw==\n-----END PKCS7-----\n';
      }else{
        callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['path']="http://10.12.0.132/recordings/voice/"+_uuid+".mp3";
        callRecording['recording']['mediaFiles'][i]['mediaId']=_uuid+"_Voice_Rec.mp3";
      }
      callRecording['recording']['mediaFiles'][i]['type']="audio/mp3";
      callRecording['recording']['mediaFiles'][i]['duration']=config[index]['voice'][i]['duration'];
      callRecording['recording']['mediaFiles'][i]['tenant']="Environment";
      callRecording['recording']['mediaFiles'][i]['ivrprofile']="GIR_MP3_No_Encryption";
      callRecording['recording']['mediaFiles'][i]['size']=config[index]['voice'][i]['size'];
      callRecording['recording']['mediaFiles'][i]['parameters']={};
      callRecording['recording']['mediaFiles'][i]['parameters']['id']=_rec_id;
      callRecording['recording']['mediaFiles'][i]['parameters']['callUuid']=_rec_id;
      callRecording['recording']['mediaFiles'][i]['partitions']=[];
      callRecording['recording']['mediaFiles'][i]['accessgroups']=["/"];
    }
    callRecording['recording']['eventHistory'][0]={};
    callRecording['recording']['eventHistory'][0]['occurredAt']="2016-05-13T18:54:44.000+0000";
    callRecording['recording']['eventHistory'][0]['calluuid']=_rec_id;
    callRecording['recording']['eventHistory'][0]['contact']={};
    callRecording['recording']['eventHistory'][0]['contact']['type']="External";
    callRecording['recording']['eventHistory'][0]['contact']['phoneNumber']="555001";
    callRecording['recording']['eventHistory'][0]['event']="Joined";

    res.json(callRecording);
  	//logger.info("Worker ",cluster.worker.id," get a request to get call recording from ccid ",_id,", recording id ",_rec_id);
  });


  //get /internal-api/contact-centers/:ccid/screen-recordings/:rec_id, return json
  app.get('/internal-api/contact-centers/:ccid/screen-recordings/:rec_id', function (req, res){
  	var _rec_id = req.params.rec_id;
  	var _id = req.params.ccid;
    var _uuid;

    var screenRecording={"statusCode":0,"recording":{"mediaFiles":[],"eventHistory":[],
    "region":"region1"}};
    var index = getCaseIndex(_rec_id);

    screenRecording['recording']['id']=_rec_id;
    screenRecording['recording']['startTime']=config[index]['startTime'];
    screenRecording['recording']['stopTime']=config[index]['stopTime'];
    for (var i=0; i<config[index]['voice'].length; i++){
      _uuid = uuid.v4();
      config[index]['screen'][i]['mediaID']=_uuid;
      screenRecording['recording']['mediaFiles'][i]={};
      screenRecording['recording']['mediaFiles'][i]['mediaUri']="http://"+req.hostname+":8080/internal-api/contact-centers/"+_id+"/screen-recordings/"+_rec_id+"/content/"+_uuid+".mp4";
      screenRecording['recording']['mediaFiles'][i]['mediaPath']="/contact-centers/"+_id+"/screen-recordings/"+_rec_id+"/content/"+_uuid+".mp4";
      screenRecording['recording']['mediaFiles'][i]['startTime']=config[index]['screen'][i]['startTime'];
      screenRecording['recording']['mediaFiles'][i]['stopTime']=config[index]['screen'][i]['stopTime'];
      screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']={};
      screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['storage']="webDAV";
      screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['data']={};
      screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['data']['storagePath']="http://10.12.0.132/recordings/screen/";
      screenRecording['recording']['mediaFiles'][i]['mediaId']=_rec_id;
      screenRecording['recording']['mediaFiles'][i]['type']="video/mp4";
      screenRecording['recording']['mediaFiles'][i]['duration']=config[index]['screen']['duration'];
      screenRecording['recording']['mediaFiles'][i]['size']=config[index]['screen']['size'];
      screenRecording['recording']['mediaFiles'][i]['parameters']={};
      screenRecording['recording']['mediaFiles'][i]['parameters']['region']="region1";
      screenRecording['recording']['mediaFiles'][i]['parameters']['contact']={};
      screenRecording['recording']['mediaFiles'][i]['parameters']['contact']['userName']="agent6001@genesys.com";
    }

    res.json(screenRecording);
  	//logger.info("Worker ",cluster.worker.id," get a request to get call recording from ccid ",_id,", recording id ",_rec_id);
  });


  //Get api/v2/settings/irp-muxer, return 403
  app.get('api/v2/settings/irp-muxer', function (req, res) {
    res.status(403).send("403!");
    logger.debug("Setting request from "+req.ip);
  });


  //get /api/v2/ops/contact-centers/:ccid/recordings/:id/play/:medianame.mp3, return mp3 file
  app.get('/api/v2/ops/contact-centers/:ccid/recordings/:id/play/:medianame.mp3', function (req, res) {
   var _ccid = req.params.ccid;
   var _rec_id = req.params.id;
   var _media_id = req.params.medianame;
   var _case_index = getCaseIndex(_rec_id);
   var _media_index = getMediaIndex(_case_index, _media_id);
   var _file_path = config[_case_index]['voice'][_media_index]['mediaPath'];
   var mp3 = new Buffer(fs.readFileSync(_file_path));
   //logger.debug("A quest from "+req.ip);
   //logger.info("Worker ",cluster.worker.id," Get a request to download file from ccid ",_ccid,", media id ",mediaid," and media file ",_media_name);
   res.status(200).send(mp3);
 })


  //get /internal-api/contact-centers/:ccid/screen-recordings/:id/content/:medianame.mp4, return mp4 file
  app.get('/internal-api/contact-centers/:ccid/screen-recordings/:id/content/:medianame.mp4', function (req, res) {
    var _ccid = req.params.ccid;
    var _rec_id = req.params.id;
    var _media_id = req.params.medianame;
    var _case_index = getCaseIndex(_rec_id);
    var _media_index = getMediaIndex(_case_index, _media_id);
    var _file_path = config[_case_index]['screen'][_media_index]['mediaPath'];
    var mp4= new Buffer(fs.readFileSync(_file_path));
    //logger.debug("A quest from "+req.ip);
    //logger.info("Worker ",cluster.worker.id," get a request to download file from ccid ",_ccid,", media id ",_id," and media file ",_media_name);
    res.status(200).send(mp4);
  })

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.post('/internal-api/contact-centers/:ccid/screen-recordings', upload.array(), function (req, res, next) {
    var _muxer1 = req.body['mediaFiles'][0]['parameters']['muxed_mediaIds'][0];
    var _muxer2 = req.body['mediaFiles'][0]['parameters']['muxed_mediaIds'][1];
    res.status(200).send("{status:0}");
    logger.info("Post Request from "+req.ip+ " for muxer id "+_muxer1+" "+_muxer2);
  });

  app.get('/api/v2/ops/contact-centers/:ccid/settings/screen-recording-encryption', function (req, res) {
    var _id = req.params.ccid;
    res.json(encryption);
    logger.info("Worker ",cluster.worker.id," get a request to screen-recording-encryption from ",_id);
  }); 

  app.delete('/internal-api/contact-centers/:ccid/screen-recordings/:rec_id/content/:mediafile.mp4', function (req, res){
  	res.status(200).send("200 OK!");
  });
  //}
  
  module.exports=app;
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
  // logger.info("Worker ",cluster.worker.id,"is running");
  //logger.info("Worker ",cluster.worker.id," is running");
  
  */
  //get /api/v2/ops/contact-centers/:ccid/recordings/:rec_id, return json
  app.get('/api/v2/ops/contact-centers/:ccid/recordings/:rec_id', function (req, res){
  	var _rec_id = req.params.rec_id;
  	var _id = req.params.ccid;
    var _uuid;
    
    var callRecording={"statusCode":0,"recording":{"callerPhoneNumber":"555001",
    "dialedPhoneNumber":"10001","mediaFiles":[],"eventHistory":[],"callType":"Inbound",
    "region":"region1"}};
    var index = getCaseIndex(_rec_id);
    if (index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      callRecording['recording']['id']=_rec_id;
      callRecording['recording']['startTime']=config[index]['startTime'];
      callRecording['recording']['stopTime']=config[index]['stopTime'];
      for (var i=0; i<config[index]['voice'].length; i++){
        _uuid = uuid.v4();
        config[index]['voice'][i]['mediaID']=_uuid;
        callRecording['recording']['mediaFiles'][i]={};
        callRecording['recording']['mediaFiles'][i]['mediaUri']="http://"+req.hostname+":"+rws_port+"/api/v2/ops/contact-centers/"+_id+"/recordings/"+_rec_id+"/play/"+_uuid+".mp3";
        callRecording['recording']['mediaFiles'][i]['mediaPath']="/ops/contact-centers/"+_id+"/recordings/"+_rec_id+"/play/"+_uuid+".mp3";
        callRecording['recording']['mediaFiles'][i]['startTime']=config[index]['voice'][i]['startTime'];
        callRecording['recording']['mediaFiles'][i]['stopTime']=config[index]['voice'][i]['stopTime'];
        callRecording['recording']['mediaFiles'][i]['callUUID']=_uuid;
        callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']={};
        callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['storage']="webDAV";
        if (config[index]['voice'][i]['encryption']=='true'){
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
      res.status(200).json(callRecording);
    }
  	logger.info("Get a request to get call recording from ccid ",_id,", recording id ",_rec_id);
  });


  //get /internal-api/contact-centers/:ccid/screen-recordings/:rec_id, return json
  app.get('/internal-api/contact-centers/:ccid/screen-recordings/:rec_id', function (req, res){
  	var _rec_id = req.params.rec_id;
  	var _id = req.params.ccid;
    var _uuid;

    var screenRecording={"statusCode":0,"recording":{"mediaFiles":[],"eventHistory":[],
    "region":"region1"}};
    var index = getCaseIndex(_rec_id);
    if (index == null){
      res.status(404).send("fail to find corresponding test case in config file!");
    }else{
      screenRecording['recording']['id']=_rec_id;
      screenRecording['recording']['startTime']=config[index]['startTime'];
      screenRecording['recording']['stopTime']=config[index]['stopTime'];
      for (var i=0; i<config[index]['voice'].length; i++){
        _uuid = uuid.v4();
        config[index]['screen'][i]['mediaID']=_uuid;
        screenRecording['recording']['mediaFiles'][i]={};
        screenRecording['recording']['mediaFiles'][i]['mediaUri']="http://"+req.hostname+":"+rws_port+"/internal-api/contact-centers/"+_id+"/screen-recordings/"+_rec_id+"/content/"+_uuid+".mp4";
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
      res.status(200).json(screenRecording);
    }
  	logger.info("Get a request to get call recording from ccid ",_id,", recording id ",_rec_id);
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
   logger.info("Get a request to download file from ccid ",_ccid,", media id ",_rec_id," and media file ",_media_id);
 });


  //get /internal-api/contact-centers/:ccid/screen-recordings/:id/content/:medianame.mp4, return mp4 file
  app.get('/internal-api/contact-centers/:ccid/screen-recordings/:id/content/:medianame.mp4', function (req, res) {
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
        var _file_path = config[_case_index]['screen'][_media_index]['mediaPath'];
        var mp4=new Buffer(fs.readFileSync(_file_path));
        res.status(200).send(mp4);
      }
    }
    logger.info("Get a request to download file from ccid ",_ccid,", media id ",_rec_id," and media file ",_media_name);
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.post('/internal-api/contact-centers/:ccid/screen-recordings', function (req, res, next) {
    var _muxer1 = req.body['mediaFiles'][0]['parameters']['muxed_mediaIds'][0];
    var _muxer2 = req.body['mediaFiles'][0]['parameters']['muxed_mediaIds'][1];
    res.status(200).send("{status:0}");
    logger.info("Post Request from "+req.ip+ " for muxer id "+_muxer1+" "+_muxer2);
  });

  app.get('/api/v2/ops/contact-centers/:ccid/settings/screen-recording-encryption', function (req, res) {
    var _id = req.params.ccid;
    res.json(encryption);
    logger.info("Get a request to screen-recording-encryption from ",_id);
  }); 

  app.delete('/internal-api/contact-centers/:ccid/screen-recordings/:rec_id/content/:mediafile.mp4', function (req, res){
    var _ccid = req.params.ccid;
    var _rec_id = req.params.rec_id;
    var _media_id = req.params.medianame;
    res.status(200).send("200 OK!");
    logger.info("Delete media file "+_media_id+" from ccid "+_ccid+" media id "+_rec_id);
  });
      //}
      
  module.exports=app;
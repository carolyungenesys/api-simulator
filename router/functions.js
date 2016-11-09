var exports = module.exports = {};
var express = require('express');
var fs=require('fs');
var app = express();
var uuid = require('uuid');
/*
exports.getCaseIndex = function getCaseIndex(case_id){
  for (var i=0; i<config.length; i++){
    if (case_id == config[i]['case_id']){
      return i;
      break;
    }
  }
  return null;
}

exports.getMediaIndex = function getMediaIndex(index,media_id,type){
  for (var i=0; i<config[index][type].length; i++){
    if (media_id == config[index][type][i]['mediaID']){
      return i;
      break;
    }
  }
  return null;
}
*/

exports.savePost = function(req, res){
  insertModel.create(req.body, function(err,result){
    if (err){
      console.error(err);
    }else{
      var _muxer1 = req.body['mediaFiles'][0]['parameters']['muxed_mediaIds'][0];
      var _muxer2 = req.body['mediaFiles'][0]['parameters']['muxed_mediaIds'][1];
      res.status(200).send("{status:0}");
      logger.info("Post Request from "+req.ip+ " for muxer id "+_muxer1+" "+_muxer2);
    }
  });
}

exports.getMediaPath = function(type, loadTest, mediaId, req, res){
  caseModel.findOne({'case_id':loadTest},function(err, obj){
    if (obj == null){
      logger.error('Could not find test case');
      res.status(500).send("Could not find test case in db");
    }else{
      logger.info("get load test");
      config = obj;
      if (type == 'voice'){
        for (var i=0; i<obj['voice'].length; i++){
          findMedia('voice', obj['voice'][i], mediaId, findMedia_callback, req, res);
        }
      }else{
        for (var i=0; i<obj['screen'].length; i++){
          findMedia('screen', obj['screen'][i], mediaId, findMedia_callback, req, res);
        }
      }
    }
  });
}

function findMedia(type, id, _media_id, callback, req, res){
  var recording_config={};
  if (type == 'voice'){
    voiceModel.findById(id, function(err, obj){
      if(obj == null){
        logger.error("Could not find media file");
        res.status(500).send("Fail to load mediaFile");
      }else{
        logger.info("get media");
        recording_config = obj;
        callback(type, _media_id, recording_config, req, res);
      }
    });
  }else{
    screenModel.findById(id, function(err, obj){
      if(obj == null){
        logger.error("Could not find media file");
        res.status(500).send("Fail to load mediaFile");
      }else{
        recording_config = obj
        callback(type, _media_id, recording_config, req, res);
      }
    });
  }
}

function findMedia_callback(type, _media_id, recording_config, req, res){
  logger.debug('media id: ',_media_id);
  logger.debug('recording config media id: ', recording_config['mediaID']);
  if (recording_config['mediaID'] == _media_id){
    var _file_path = recording_config['mediaPath'];
    var file = new Buffer(fs.readFileSync(_file_path));
    if (type == 'voice'){
      res.type('mp3');
    }else{
      res.type('mp4');
    }
    logger.info('send media success');
    res.status(200).send(file);
  }
}

exports.formConfig = function(loadTest, ccid, req, res, type){
  var config = {};
  caseModel.findOne({'case_id':loadTest}, function(err, obj){
    if (obj == null){
      logger.error("Could not find test case");
      res.status(500).send("Could not find test case in db");
    }else{
      config = obj;
      if (type == 'voice'){
        callRecording['recording']['id']=loadTest;
        callRecording['recording']['startTime']=config['startTime'];
        callRecording['recording']['stopTime']=config['stopTime'];
        callRecording['recording']['eventHistory'][0]={};
        callRecording['recording']['eventHistory'][0]['occurredAt']="2016-05-13T18:54:44.000+0000";
        callRecording['recording']['eventHistory'][0]['calluuid']=loadTest;
        callRecording['recording']['eventHistory'][0]['contact']={};
        callRecording['recording']['eventHistory'][0]['contact']['type']="External";
        callRecording['recording']['eventHistory'][0]['contact']['phoneNumber']="555001";
        callRecording['recording']['eventHistory'][0]['event']="Joined";
      }else{
        screenRecording['recording']['id']=loadTest;
        screenRecording['recording']['startTime']=config['startTime'];
        screenRecording['recording']['stopTime']=config['stopTime'];
      }
      for (var i=0; i<config[type].length; i++){
        getLoadTest_recording(type, loadTest, ccid, config[type][i], i==config[type].length-1, i, req, res, formConfig_callback);
      }
    }
  });
}

function getLoadTest_recording (type, loadTest, ccid, id, send, i, req, res, callback){
  var recording_config = {};
  if (type == 'voice'){
    voiceModel.findById(id, function(err, obj){
      if(obj == null){
        logger.error("Could not find media file");
        res.status(500).send("Fail to load mediaFile");
      }else{
        recording_config = obj;
      }
    });
  }else{
    screenModel.findById(id, function(err, obj){
      if(obj.length == 0){
        logger.error("Could not find media file");
      }else{
        recording_config = obj;
      }
    });
  }
  callback(type, id, loadTest, ccid, recording_config, send, i, req, res);
}

function formConfig_callback(type, dbid, _rec_id, _id, recording_config, send, i, req, res){
  var _uuid = uuid.v4();
  voiceModel.update({'_id':dbid},{'mediaID':_uuid},function(err,result){
    if (err){
      logger.info(err);
    }
    else{
      logger.debug('Update mediaID result: ',result);
      if (type == 'voice'){
        callRecording['recording']['mediaFiles'][i]={};
        callRecording['recording']['mediaFiles'][i]['startTime']=recording_config['startTime'];
        callRecording['recording']['mediaFiles'][i]['stopTime']=recording_config['stopTime'];
        callRecording['recording']['mediaFiles'][i]['callUUID']=_uuid;
        callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']={};
        callRecording['recording']['mediaFiles'][i]['mediaUri']="http://"+req.hostname+":"+rws_port+"/api/v2/ops/contact-centers/"+_id+"/recordings/"+_rec_id+"/play/"+_uuid+".mp3";
        callRecording['recording']['mediaFiles'][i]['mediaPath']="/ops/contact-centers/"+_id+"/recordings/"+_rec_id+"/play/"+_uuid+".mp3";

        callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['storage']="webDAV";
        if (recording_config['encryption']=='true'){
          callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['path']="http://10.12.0.132/recordings/voice/"+_uuid+".mp3.bin";
          callRecording['recording']['mediaFiles'][i]['mediaId']=_uuid+".mp3.bin";
          callRecording['recording']['mediaFiles'][i]['pkcs7']='-----BEGIN PKCS7-----\nMIIBNQYJKoZIhvcNAQcDoIIBJjCCASICAQAxgfAwge0CAQAwVjBRMQswCQYDVQQGEwJVUzELMAkG\nA1UECAwCQ0ExEjAQBgNVBAcMCURhbHkgQ2l0eTEQMA4GA1UECgwHR2VuZXN5czEPMA0GA1UEAwwG\nZ2lyX3FhAgEKMA0GCSqGSIb3DQEBAQUABIGAsYZ1QVw3dmeTRz1QwS7mbj1bffGQznP+9wjAf7TQ\nALoeolF1ctmm+xXOvXdpuUHfnmTqeJXF9Ov2sQfIG3kXr4nuY87kMpiFIlqHQfQ4G0taMUs6KDff\nI/IYEx0wX/VloM6uN7Q564xDAffA8V4HnBXgxm8B2zm3aQrXMhttMjUwKgYJKoZIhvcNAQcBMB0G\nCWCGSAFlAwQBKgQQ5JL1BpqK71JXStm+mbnHiw==\n-----END PKCS7-----\n';
        }else{
          callRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['path']="http://10.12.0.132/recordings/voice/"+_uuid+".mp3";
          callRecording['recording']['mediaFiles'][i]['mediaId']=_uuid+".mp3";
        }
        callRecording['recording']['mediaFiles'][i]['type']="audio/mp3";
        callRecording['recording']['mediaFiles'][i]['duration']=recording_config['duration'];
        callRecording['recording']['mediaFiles'][i]['tenant']="Environment";
        callRecording['recording']['mediaFiles'][i]['ivrprofile']="GIR_MP3_No_Encryption";
        callRecording['recording']['mediaFiles'][i]['size']=recording_config['size'];
        callRecording['recording']['mediaFiles'][i]['parameters']={};
        callRecording['recording']['mediaFiles'][i]['parameters']['id']=_rec_id;
        callRecording['recording']['mediaFiles'][i]['parameters']['callUuid']=_rec_id;
        callRecording['recording']['mediaFiles'][i]['partitions']=[];
        callRecording['recording']['mediaFiles'][i]['accessgroups']=["/"];
      }else{
        screenRecording['recording']['mediaFiles'][i]={};
        screenRecording['recording']['mediaFiles'][i]['mediaUri']="http://"+req.hostname+":"+rws_port+"/internal-api/contact-centers/"+_id+"/screen-recordings/"+_rec_id+"/content/"+_uuid+".mp4";
        screenRecording['recording']['mediaFiles'][i]['mediaPath']="/contact-centers/"+_id+"/screen-recordings/"+_rec_id+"/content/"+_uuid+".mp4";
        screenRecording['recording']['mediaFiles'][i]['startTime']=recording_config['startTime'];
        screenRecording['recording']['mediaFiles'][i]['stopTime']=recording_config['stopTime'];
        screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']={};
        screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['storage']="webDAV";
        screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['path']=_uuid+".mp4";
        screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['data']={};
        screenRecording['recording']['mediaFiles'][i]['originalMediaDescriptor']['data']['storagePath']="http://10.12.0.132/recordings/screen/";
        screenRecording['recording']['mediaFiles'][i]['mediaId']=_uuid+".mp4";
        screenRecording['recording']['mediaFiles'][i]['type']="video/mp4";
        screenRecording['recording']['mediaFiles'][i]['duration']=recording_config['duration'];
        screenRecording['recording']['mediaFiles'][i]['size']=recording_config['size'];
        screenRecording['recording']['mediaFiles'][i]['parameters']={};
        screenRecording['recording']['mediaFiles'][i]['parameters']['region']="region1";
        screenRecording['recording']['mediaFiles'][i]['parameters']['contact']={};
        screenRecording['recording']['mediaFiles'][i]['parameters']['contact']['userName']="agent6001@genesys.com";
      }
      if (send){
        if (type == 'voice'){
          res.status(200).json(callRecording);
        }else{
          res.status(200).json(screenRecording)
        }
      }
    }
  });
  
}
var express = require('express');
var app = require('./plot.js');
var fs=require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');
var url = require('url');
var createClient = require('webdav');
var path = require('path');
var client = createClient(
	"http://10.0.0.119/recordings/",
	"user",
	"password"
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/mongodb/update', function(req, res){
	for (var i=0; i<req.body.length; i++){
		var flag;
		var tmpid;
		var Temp = req.body[i];
		caseModel.findOne({'case_id':Temp['case_id']}, function(err, obj){
			if (obj == null){
				logger.info('Could not find existing test case. Going to insert to db.');
				flag = false;
			}else{
				logger.info('Find existing test case in db. Going to update.');
				flag = true;
			}
			var caseTmp = {'voice':[],'screen':[]};
			caseTmp['_id'] = mongoose.Types.ObjectId();
			caseTmp['case_id']=Temp['case_id'];
			caseTmp['startTime']=Temp['startTime'];
			caseTmp['stopTime']=Temp['stopTime'];
			for (var j=0; j<Temp['voice'].length; j++){
				var voiceTmp = {};
				voiceTmp['_id'] = new mongoose.Types.ObjectId();
				voiceTmp['startTime'] = Temp['voice'][j]['startTime'];
				voiceTmp['stopTime'] = Temp['voice'][j]['stopTime'];
				voiceTmp['mediaPath'] = Temp['voice'][j]['mediaPath'];
				voiceTmp['encryption'] = Temp['voice'][j]['encryption'];
				voiceTmp['duration'] = Temp['voice'][j]['duration'];
				voiceTmp['Size'] = Temp['voice'][j]['size'];
				caseTmp['voice'].push(voiceTmp['_id']);
				if (flag == false){
					voiceModel.create(voiceTmp, function(err,voice){
						if (err){
							logger.error(err);
							res.status(500).send('Fail insert voice recording');
							exit(1);
						}else{
							logger.info('Insert voice recording ', voice.id, ' success');
						}
					});
				}else{
					tmpid = voiceTmp['_id'];
					delete voiceTmp['_id'];
					voiceModel.update(voiceTmp, function(err,voice){
						if (err){
							logger.error(err);
							res.status(500).send('Fail update voice recording');
							exit(1);
						}else{
							logger.info('Update voice recording success');
						}
					});
				}
			}
			for (var k=0; k<Temp['screen'].length; k++){
				var screenTmp = {};
				screenTmp['_id'] = mongoose.Types.ObjectId();
				screenTmp['startTime'] = Temp['screen'][k]['startTime'];
				screenTmp['stopTime'] = Temp['screen'][k]['stopTime'];
				screenTmp['mediaPath'] = Temp['screen'][k]['mediaPath'];
				screenTmp['encryption'] = Temp['screen'][k]['encryption'];
				screenTmp['duration'] = Temp['screen'][k]['duration'];
				screenTmp['Size'] = Temp['screen'][k]['size'];
				caseTmp['screen'].push(screenTmp['_id']);
				if (flag == false){
					screenModel.create(screenTmp, function(err,screen){
						if (err) {
							logger.error(err);
							res.status(500).send('Fail insert screen recording');
							exit(1);
						}else{
							logger.info('Insert screen recording ', screen.id, ' success');
						}
					});
				}else{
					tmpid = screenTmp['_id'];
					delete screenTmp['_id'];
					screenModel.update(screenTmp, function(err,screen){
						if (err) {
							logger.error(err);
							res.status(500).send('Fail update screen recording');
							exit(1);
						}else{
							logger.info('Upload screen recording success');
						}
					});
				}
			}
			if (flag == false){
				caseModel.create(caseTmp, function(err,test){
					if (err) {
						logger.error(err);
						res.status(500).send('Fail insert test case');
						exit(1);
					}else{
						logger.info('Insert test case ', test.id, ' success');
					}
				});
			}else{
				tmpid = caseTmp['_id'];
				delete caseTmp['_id'];
				caseModel.update({'_id':tmpid},caseTmp, function(err,test){
					if (err) {
						logger.error(err);
						res.status(500).send('Fail update test case');
						exit(1);
					}else{
						logger.info('Upload test case success');
					}
				});
			}
		});
	}
	res.status(200).send('Update Mongodb Successfully!');
});

app.get('/media/:media', function(req, res){
	var media = req.params.media;
	var file = "./media/"+media;
	var webdav = "/screenrecordings/Node119/"+media;
	client
    .getFileContents(webdav)
    .then(function(Data) {
        fs.writeFileSync(file, Data);
	    fs.stat(file, function(err, stats) {
	      if (err) {
	        if (err.code === 'ENOENT') {
	        	logger.error(404);
	          return res.sendStatus(404);
	        }
	      res.end(err);
	      }
	      var range = req.headers.range;
	      if (!range) {
	      		logger.error(416);
	       return res.sendStatus(416);
	      }
	      var positions = range.replace(/bytes=/, "").split("-");
	      var start = parseInt(positions[0], 10);
	      var total = stats.size;
	      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
	      var chunksize = (end - start) + 1;

	      res.writeHead(206, {
	        "Content-Range": "bytes " + start + "-" + end + "/" + total,
	        "Accept-Ranges": "bytes",
	        "Content-Length": chunksize,
	        "Content-Type": "video/mp4"
	      });

	      var stream = fs.createReadStream(file, { start: start, end: end })
	        .on("open", function() {
	          stream.pipe(res);
	        }).on("error", function(err) {
	          res.end(err);
	        });
	    });
    })
    .catch(function(err) {
       	logger.error(err);
	});
});
module.exports = app;
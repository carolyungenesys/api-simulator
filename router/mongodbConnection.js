var express = require('express');
var app = express();
var fs=require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
/*
function findExisting(case_id){
	caseModel.findOne({'case_id':case_id}, function(err, obj){
		if (obj == null){
			logger.info('Could not find existing test case. Going to insert to db.');
			flag = false;
		}else{
			logger.info('Find existing test case in db. Going to update.');
			flag = true;
		}
	return flag;
	});
}
*/

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

app.get('/mongodb/search/:section/:field/:value',function(req, res){
	var section = req.params.section;
	var field = req.params.field;
	var value = req.params.value;
	if (section == 'case'){
		var tmp = {};
		tmp[field]=value;
		caseModel.findOne(tmp, function(err, obj){
			res.send(obj);
		});
	}else if (section == 'voice'){
		var tmp = {};
		tmp[field]=value;
		voiceModel.findOne(tmp, function(err, obj){
			res.send(obj);
		});
	}else if (section == 'screen'){
		var tmp = {};
		tmp[field]=value;
		screenModel.findOne(tmp, function(err, obj){
			res.send(obj);
		});
	}else{
		exit(0);
	}
});

app.get('/mongodb/insert_recording/metadata/:rec_id', function(req, res){
	var tmp = {};
	var _rec_id = req.params.rec_id;
	insertModel.findOne({'id':_rec_id}, function(err, obj){
		if (err){
			console.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found')
		}else{
			tmp = obj;
			res.status(200).json(tmp);
		}
	});
});

app.get('/mongodb/insert_recording/search', function(req, res){
	var tmp = {};
	//console.log(req.query);
	insertModel.findOne({'size':'14258043'}, function(err, obj){
		if (err){
			console.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found')
		}else{
			tmp = obj;
			res.status(200).json(tmp);
		}
	});
});

module.exports = app;
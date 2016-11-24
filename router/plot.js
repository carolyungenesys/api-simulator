var express = require('express');
var fs=require('fs');
var csv= require('csv');
var user = require('./login.js');
var app = express();
var path = require('path');

function _arraytosting(_array){
	var result="";
	for (var i=0; i<_array.length; i++){
		result=result+_array[i]+',';
	}
	return result;
}

app.use('/', user);

app.get('/testcase/specific/:testcase', function(req, res){
	var testcase = req.params.testcase;
	var testcases = [];
	if (req.user == "" || req.user == null){
		user = 'Login';
	}else{
		user = req.user.username;
	}
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		fs.readFile('./public/data/'+testcase+'_report.json', function(err, data){
			if (err) {
				logger.error(err);
				res.render('error.ejs',{
					user: user,
					testcases: testcases,
					code: '404',
					msg: "Can't find test report.json." 
				});
			}else{
				data = JSON.parse(data);
				var result = 'PASS';
				for(var key in data){
				    if (data[key]['result']=='FAIL'){
				    	result ='FAIL';
				    }
				}
				res.render('chart.ejs', {
					user: user,
					testcases: testcases,
					testcase: testcase,
					data: data,
					result: result
				});
			}
		});
	});
});

app.get('/testcase/chart/:testcase/:element', function(req, res){
	var testcase = req.params.testcase;
	var element = req.params.element;
	var result = [];
	if (req.user == "" || req.user == null){
		user = 'Login';
	}else{
		user = req.user.username;
	}
	fs.readFile('./public/data/'+testcase+'.csv', function(err,data){
		if (err){
			logger.error(err);
			res.render('error.ejs',{
				user: user,
				testcases: testcases,
				code: '404',
				msg: "Can't find test data.csv." 
			});
		}else{
			csv.parse(data, function (err, data){
				if (err){
					logger.error(err);
					res.render('error.ejs',{
						user: user,
						testcases: testcases,
						code: '400',
						msg: "Invalid test data.csv." 
					});
				}else{
					for (var i=1; i<data.length; i++){
						result.push(data[i][element]);
					}
					result = result.toString();
					res.status(200).send(result);
				}
			});
		}
	});
});

//send to all test info
app.get('/testcase/all/:testcase', function(req, res){
	var testcases = [];
	var testcase = req.params.testcase;
	if (req.user == "" || req.user == null){
		user = 'Login';
	}else{
		user = req.user.username;
	}
	caseModel.find({}, function(err, obj){
		if (err){
			logger.error(err);
		}
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		if (testcase == 'main'){
			testcase = testcases[0];
		}
		fs.readFile('./public/data/'+testcase+'_report.json', function(err, data){
			if (err) {
				logger.error(err);
				res.render('error.ejs',{
					user: user,
					testcases: testcases,
					code: '404',
					msg: "Can't find test report.json." 
				});
			}else {
				data = JSON.parse(data);
				res.render('all.ejs',{
					user: user,
					testcases: testcases,
					data: data
				});
			}
		});
	});
});

//downlaod csv
app.get('/testcase/download/:testcase', function(req, res){
	var testcase = req.params.testcase;
	res.download('./public/data/'+testcase+'.csv');
});

//send to searching for tests
app.get('/testcase/media/search/', function(req, res){
	var tmp = {};
	var start = req.query.startTime;
	var stop = req.query.stopTime;
	if (req.user == "" || req.user == null){
		user = 'Login';
	}else{
		user = req.user.username;
	}
	if (req.query.id != null && req.query.id != ""){
		tmp['id'] = req.query.id;
	}
	var result = [];
	var testcases = [];
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		insertModel.find(tmp, function(err, obj){
			if (err){
				logger.error(err);
			}
			if (obj.length == 0){
				res.status(404).send('No rec||ding found')
			}else{
				if (start != "" && stop == ""){
					for (var i=0; i<obj.length; i++){
						for (var j=0; j<obj[i]['startTime'].length; j++){
							if (obj[i]['startTime'][j] >= start){
								result.push(obj[i]);
								break;
							}
						}
					}
				}else if (stop != "" && start == ""){
					for (var i=0; i<obj.length; i++){
						for (var j=0; j<obj[i]['stopTime'].length; j++){
							if (obj[i]['stopTime'][j] <= stop){
								result.push(obj[i]);
								break;
							}
						}
					}
				}else if (stop != "" && start != ""){
					for (var i=0; i<obj.length; i++){
						for (var j=0; j<obj[i]['stopTime'].length; j++){
							if (obj[i]['stopTime'][j] <= stop && obj[i]['startTime'][j] >= start){
								result.push(obj[i]);
								break;
							}
						}
					}
				}else {
					for (var i=0; i<obj.length; i++){
						result.push(obj[i]);
					}
				}
				var _id = [];
				var __mediaid = [];
				var __start =[];
				var __stop = [];
				var __duration = [];
				var __size = [];
				var __type = [];
				for (var i=0; i<result.length; i++){
					_id.push(result[i]['id']);
					var _mediaid = [];
					var _start =[];
					var _stop = [];
					var _duration = [];
					var _size = [];
					var _type = [];
					for (var j=0; j<result[i]['mediaFiles'].length; j++){
						_mediaid.push(result[i]['mediaFiles'][j]['mediaId']);
						_start.push(result[i]['mediaFiles'][j]['startTime']);
						_stop.push(result[i]['mediaFiles'][j]['stopTime']);
						_duration.push(result[i]['mediaFiles'][j]['duration']);
						_size.push(result[i]['mediaFiles'][j]['size']);
						_type.push(result[i]['mediaFiles'][j]['type']);
					}
					__mediaid.push(_mediaid);
					__start.push(_start);
					__stop.push(_stop);
					__duration.push(_duration);
					__size.push(_size);
					__type.push(_type);
				}
				res.render('query.ejs', {
					user: user,
					testcases: testcases,
					id: _id,
					mediaid: __mediaid,
					start: __start,
					stop: __stop,
					duration: __duration,
					size: __size,
					type: __type
				});
			}
		}).limit(100);
	});
});

//send to media info and video
app.get('/testcase/media/details/:id/:media', function(req, res){
	var id = req.params.id;
	var mediaid  = req.params.media;
	var testcases = [];
	if (req.user == "" || req.user == null){
		user = 'Login';
	}else{
		user = req.user.username;
	}
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		insertModel.findOne({'id':id}, function(err, obj){
			if (err){
				logger.error(err);
			}
			if (obj.length == 0){
				logger.error(err);
				res.status(404).send(new Buffer("<p>Can't find media file.</p>"));
			}else{
				var region;
				var usr;
				var mux;
				var _path;
				var storage;
				var storagePath;
				for (var i=0; i<obj['mediaFiles'].length; i++){
					if (obj['mediaFiles'][i]['mediaId'] == mediaid){
						region = obj['mediaFiles'][i]['parameters']['region'];
						usr = obj['mediaFiles'][i]['parameters']['contact']['userName'];
						mux = obj['mediaFiles'][i]['parameters']['muxed_mediaIds'];
						_path = path.basename(obj['mediaFiles'][i]['mediaDescript||']['path']);
						storage = obj['mediaFiles'][i]['mediaDescript||']['storage'];
						storagePath = obj['mediaFiles'][i]['mediaDescript||']['data']['storagePath'];
					}
				}
				res.render('detail.ejs', {
					user: user,
					testcases: testcases,
					id: id,
					mediaid: mediaid,
					region: region,
					usr: usr,
					mux: mux,
					path: _path,
					storage: storage,
					storagePath: storagePath
				});
			}
		});
	});
});


//send to show log
app.get('/testcase/logs/:testcase', function(req, res){
	var testcases = [];
	var testcase = req.params.testcase;
	if (req.user == "" || req.user == null){
		user = 'Login';
	}else{
		user = req.user.username;
	}
	caseModel.find({}, function(err, obj){
		if (err){
			logger.error(err);
		}
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		if (testcase == 'main'){
			testcase = testcases[0];
		}
		fs.readFile('./public/logs/'+testcase+'.log', function(err, data){
			if (err){
				logger.error(err);
				res.render('error.ejs',{
					user: user,
					testcases: testcases,
					code: '404',
					msg: "Can't find log file." 
				});
			}else{
				var log = data.toString();
				res.render('logs.ejs',{
					user: user,
					testcases: testcases,
					testcase: testcase,
					log: log
				});
			}

		});
	});
});

app.get('/',function(req, res){
	res.redirect('/testcase/all/main');
});

module.exports = app;
var express = require('express');
var fs=require('fs');
var csv= require('csv');
var app = express();
var path = require('path');

function _arraytosting(_array){
	var result="";
	for (var i=0; i<_array.length; i++){
		result=result+_array[i]+',';
	}
	return result;
}

//send to test specific info and chart
app.get('/testcase/specific/:testcase', function(req, res){
	var testcase = req.params.testcase;
	var time=[];
	var cpu_in_percentage=[];
	var handler_count=[];
	var cpu_idle_time=[];
	var network_interface_time=[];
	var thread_count=[];
	var private_bytes=[];
	var iops=[];
	var testcases = [];
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found')
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		fs.readFile('./public/data/'+testcase+'.csv', function(err,data){
			csv.parse(data, function (err, data){
				if (err){
					logger.error(err);
				}
				for (var i=1; i<data.length; i++){
					time.push('"'+data[i][0]+'"');
					cpu_in_percentage.push(data[i][7]);
					handler_count.push(data[i][8]);
					cpu_idle_time.push(data[i][12]);
					network_interface_time.push(data[i][6]);
					thread_count.push(data[i][9]);
					private_bytes.push(data[i][11]);
					iops.push(data[i][29]);
				}
				fs.readFile('./public/js/chart_tmp.js', function(err,data){
					data = data.toString();
					if (err) {
						throw err;
					}
					var result = data;
					for (var i=0; i<7; i++){
						result = result.replace('[label]', _arraytosting(time));
					}
					result = result.replace('[cpu_in_percentage]',_arraytosting(cpu_in_percentage));
					result = result.replace('[handler_count]',_arraytosting(handler_count));
					result = result.replace('[cpu_idle_time]',_arraytosting(cpu_idle_time));
					result = result.replace('[network_interface_time]',_arraytosting(network_interface_time));
					result = result.replace('[thread_count]',_arraytosting(thread_count));
					result = result.replace('[private_bytes]',_arraytosting(private_bytes));
					result = result.replace('[iops]',_arraytosting(iops));
					fs.writeFile('./public/js/chart.js',result, (err) => {
						if (err) throw err;
						fs.readFile('./public/data/'+testcase+'_report.json', function(err, data){
							if (err) throw err;
							data = JSON.parse(data);
							res.render('chart.ejs', {
								testcases: testcases,
								testcase: testcase,
								data: data
							});
						});
					});
				});
			});
		});
	});
});

//send to all test info
app.get('/testcase/all/:testcase', function(req, res){
	var testcases = [];
	var testcase = req.params.testcase;
	caseModel.find({}, function(err, obj){
		if (err){
			logger.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found')
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		if (testcase == 'main'){
			testcase = testcases[0];
		}
		fs.readFile('./public/data/'+testcase+'_report.json', function(err, data){
			if (err) throw err;
			data = JSON.parse(data);
			res.render('all.ejs',{
				testcases: testcases,
				data: data
			});
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
	if (req.query.id != null && req.query.id != ""){
		tmp['id'] = req.query.id;
	}
	var result = [];
	var testcases = [];
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found')
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		insertModel.find(tmp, function(err, obj){
			if (err){
				logger.error(err);
			}
			if (obj == null){
				res.status(404).send('No recording found')
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
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found')
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
		}
		insertModel.findOne({'id':id}, function(err, obj){
			if (err){
				logger.error(err);
			}
			if (obj == null){
				res.status(404).send('No recording found')
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
						_path = path.basename(obj['mediaFiles'][i]['mediaDescriptor']['path']);
						storage = obj['mediaFiles'][i]['mediaDescriptor']['storage'];
						storagePath = obj['mediaFiles'][i]['mediaDescriptor']['data']['storagePath'];
					}
				}
				res.render('detail.ejs', {
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

module.exports = app;
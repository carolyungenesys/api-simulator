//set up routers
var rws = require('./router/rws_router.js');
var rcs = require('./router/rcs_router.js');
var mongo = require('./router/mongodb.js');

var express = require('express');
var fs = require('fs');
var winston = require('winston');
var bodyParser = require('body-parser');
var cluster=require('cluster');
var numCPUs=require('os').cpus().length;

var mongoose = require('mongoose');

//connect to database
var url = 'mongodb://localhost:27017/api_simulator';
connection = mongoose.connect(url, function(err) {
    if (err) console.log(err);
});


//mongodb schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var casePost = new Schema({
    case_id: {type: String, required: true},
    startTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    stopTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    voice: [ObjectId],
    screen: [ObjectId]
});

var voicePost = new Schema({
    mediaID: {type: String},
    startTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    stopTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    mediaPath: {type: String, required: true, match: /.*\.mp3/},
    encryption: Boolean,
    duration: Number,
    Size: Number
});

var screenPost = new Schema({
    mediaID: {type: String},
    startTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    stopTime: {type: String, match: /\d\d\d\d-\d\d-\d\dT\d\d\:\d\d\:\d\d\.\d\d\d\+\d\d\d\d/},
    mediaPath: {type: String, required: true, match: /.*\.mp4/},
    encryption: Boolean,
    duration: Number,
    Size: Number
});

var insertPost = new Schema({
    id: String,
    mediaFiles:[],
    startTime:[],
    stopTime:[]
});

//define global mongodb connection model
global.caseModel = connection.model('LoadTest', casePost);
global.voiceModel = connection.model('Voice', voicePost);
global.screenModel = connection.model('Screen', screenPost);
global.insertModel = connection.model('Insert', insertPost);
global.callRecording={"statusCode":0,"recording":{"callerPhoneNumber":"555001","dialedPhoneNumber":"10001","mediaFiles":[],"eventHistory":[],"callType":"Inbound","region":"region1"}};
global.screenRecording={"statusCode":0,"recording":{"mediaFiles":[],"eventHistory":[],
    "region":"region1"}};


//check if log file exists
var log_dir="./logs";
if(!fs.existsSync(log_dir)){
  fs.mkdirSync(log_dir);
}

//write to log file 
const tsFormat = () => (new Date()).toLocaleTimeString();
global.logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: tsFormat,
            level: 'debug'
        }),
        new (require('winston-daily-rotate-file'))({
            level: 'debug',
            datePattern: 'yyyy_MM_dd_mm_HH_',
            prepend: true,
            timestamp: tsFormat,
            filename: './logs/rws_all-logs.log'
        })
    ],
    exitOnError: false
}); 

//fork workers
if (cluster.isMaster) {
    numCPUs=(numCPUs-2)>0?numCPUs-2:numCPUs;
    for (var i = 0; i < numCPUs; i++){
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    });
}else{
    logger.info("Worker ",cluster.worker.id,"is running");
    global.worker_id=cluster.worker.id;
    
    //listen to mongodb on 8083
    var mongo_listener = mongo.listen(8083, 'localhost', function (err){
        if (err){
            logger.error(err);
        }
        mongo.use(express.static(__dirname + '/public'));
        //listen to rws on 8081
        var rws_listener = rws.listen(8081, 'localhost', function (err){
            if (err){
            logger.error(err);
            } 
            else{
                global.rws_port = rws_listener.address().port;
                logger.info("RWS %d: listening at http://%s:%s",worker_id,rws_listener.address().address,rws_listener.address().port);
            }
        });

        //listen to rcs on 8082
        var rcs_listener = rcs.listen(8082, 'localhost', function (err){
            if (err){
               logger.error(err);
            } 
            else{
                logger.info("RCS %d: listening at http://%s:%s",worker_id,rcs_listener.address().address,rcs_listener.address().port);
            }
        });
    });
}
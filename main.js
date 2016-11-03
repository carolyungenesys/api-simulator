var rws = require('./router/rws_router.js');
var rcs = require('./router/rcs_router.js');
var fs = require('fs');
var winston = require('winston');

var log_dir="./logs";
if(!fs.existsSync(log_dir)){
  fs.mkdirSync(log_dir);
}
global.config = JSON.parse(fs.readFileSync("./config/config.json"));
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

var rws_listener = rws.listen(8081, function (err){
    if (err){
	   console.error(err);
    } 
});

var rcs_listener = rcs.listen(8082, function (err){
    if (err){
       console.error(err);
    } 
});

global.rws_port = rws_listener.address().port;
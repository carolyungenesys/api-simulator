var rws = require('./rws_router.js');
//var rcs = require('./rcs_router.js');

var winston = require('winston');
const tsFormat = () => (new Date()).toLocaleTimeString();
var logger = new winston.Logger({
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

rws.listen(8081,'135.17.178.64',function (err){
    if (err){
	   console.log("rws error");
    } 
});


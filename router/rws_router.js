var express = require('express');
var fs=require('fs');
var app = express();
var path='./media';
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var uuid = require('uuid');
var numCPUs=require('os').cpus().length;
var winston = require('winston');
var functions = require('./functions.js');

//get /api/v2/ops/contact-centers/:ccid/recordings/:rec_id, return json
app.get('/api/v2/ops/contact-centers/:ccid/recordings/:rec_id', functions.auth, function (req, res){
  var _rec_id = req.params.rec_id;
  var _id = req.params.ccid;
  functions.formConfig(_rec_id, _id,req,res,'voice');
  logger.info("RWS",worker_id,": Get a request to get call recording from ccid ",_id,", recording id ",_rec_id);
});


//get /internal-api/contact-centers/:ccid/screen-recordings/:rec_id, return json
app.get('/internal-api/contact-centers/:ccid/screen-recordings/:rec_id', functions.auth, function (req, res){
  var _rec_id = req.params.rec_id;
  var _id = req.params.ccid;
  functions.formConfig(_rec_id,_id,req,res,'screen');
  logger.info("RWS",worker_id,": Get a request to get call recording from ccid ",_id,", recording id ",_rec_id);
});


//Get api/v2/settings/irp-muxer, return 403
app.get('api/v2/settings/irp-muxer', functions.auth, function (req, res) {
  res.status(403).send("403!");
  logger.debug("RWS",worker_id,": Setting request from "+req.ip);
});


//get /api/v2/ops/contact-centers/:ccid/recordings/:id/play/:medianame.mp3, return mp3 file
app.get('/api/v2/ops/contact-centers/:ccid/recordings/:id/play/:medianame.mp3', functions.auth, function (req, res) {
 var _ccid = req.params.ccid;
 var _rec_id = req.params.id;
 var _media_id = req.params.medianame;
 functions.getMediaPath('voice', _rec_id, _media_id, req, res);
 logger.info("RWS",worker_id,": Get a request to download file from ccid ",_ccid,", media id ",_rec_id," and media file ",_media_id+".mp3");
});

//get /internal-api/contact-centers/:ccid/screen-recordings/:id/content/:medianame.mp4, return mp4 file
app.get('/internal-api/contact-centers/:ccid/screen-recordings/:id/content/:medianame.mp4', functions.auth, function (req, res) {
  var _ccid = req.params.ccid;
  var _rec_id = req.params.id;
  var _media_id = req.params.medianame;
  functions.getMediaPath('screen', _rec_id, _media_id, req, res);
  logger.info("RWS",worker_id,": Get a request to download file from ccid ",_ccid,", media id ",_rec_id," and media file ",_media_id,".mp4");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/internal-api/contact-centers/:ccid/screen-recordings', function (req, res) {
  functions.savePost(req, res);
});


app.get('/api/v2/ops/contact-centers/:ccid/settings/screen-recording-encryption', functions.auth, function (req, res) {
  var _id = req.params.ccid;
  var encryption = {
    "statusCode": 0,
    "settings": [
    {
      "name": "certificatealias-1",
      "value": "rcs_Environment:1:C=US,ST=CA,L=Daly City,O=Genesys,CN=gir_qa:10"
    },
    {
      "name": "certificate-1",
      "value": "-----BEGIN CERTIFICATE-----\r\nMIIC8TCCAdmgAwIBAgIBCjANBgkqhkiG9w0BAQUFADBRMQswCQYDVQQGEwJVUzEL\r\nMAkGA1UECAwCQ0ExEjAQBgNVBAcMCURhbHkgQ2l0eTEQMA4GA1UECgwHR2VuZXN5\r\nczEPMA0GA1UEAwwGZ2lyX3FhMB4XDTE1MTEwMzE3MzYzMFoXDTI1MTAzMTE3MzYz\r\nMFowOjEMMAoGA1UEAwwDZ2lyMQswCQYDVQQIDAJDQTELMAkGA1UEBhMCVVMxEDAO\r\nBgNVBAoMB0dlbmVzeXMwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAM5BB3CO\r\nlNeMyvXeb/gL47L3y8liT247w4FDDXcLJ6ZOM8yDCg9zkdEVXl73xT+hIBOsBdkV\r\nCvkryXgv8UBMLVVzuy/6NGPf/059eai/CgpDaUb059/g6i+KQINkJmpIzpLJAQ+c\r\nIqa0jV2uu35zEkM5GD21QLuk2IJGfb/vbeslAgMBAAGjbzBtMAkGA1UdEwQCMAAw\r\nHQYDVR0OBBYEFDxSXuIdfXcBpj9MfyKqZ2Y/7mYBMB8GA1UdIwQYMBaAFONw1Cc/\r\nk2z+e+xYxObMswG9bcFTMAsGA1UdDwQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcD\r\nATANBgkqhkiG9w0BAQUFAAOCAQEAckUQP4b+xjJDXyBRL0XStU2fvDZULFnx8AN4\r\nCP6449OeHlWBML/yLDUABcexaSqcSjaf22zQJ7DQONhwRXnpiqX0QPD7wAbC48Ei\r\nGVVmRWZDNkbIuG4BTUk0SkERnHSseytXiM4dKL8gXGr3oVVXGtafXZvOo3MHszWZ\r\nwuQvxQlLPAKLMlA4lHPlQAadd6Y13jJTK+MPX4kedDlimMmYCfglQ5y1vF2FQ+RE\r\n7KPpoo96dGvlifK7vCPDOHvo0obj/jd8ellxMCkp1xZ0NAutN9bBqicSVZNQFTJG\r\nqGsHz2+nEDuUAvahznhJL5UBf1r/LZSB5uKcMacjGoMKlqb4hg==\r\n-----END CERTIFICATE-----\r\n"
    }
    ],
    "key": "name"
  }
  res.json(encryption);
  logger.info("RWS",worker_id,": Get a request to screen-recording-encryption from ",_id);
}); 

app.delete('/internal-api/contact-centers/:ccid/screen-recordings/:rec_id/content/:mediafile.mp4', functions.auth, function (req, res){
  var _ccid = req.params.ccid;
  var _rec_id = req.params.rec_id;
  var _media_id = req.params.medianame;
  res.status(200).send("200 OK!");
  logger.info("RWS",worker_id,": Delete media file "+_media_id+" from ccid "+_ccid+" media id "+_rec_id);
});

module.exports=app;
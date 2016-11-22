var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var historyPost = new Schema({
    owner: String,
    startTime: String,
    preScript: String,
    command: String,
    postScript: String,
    log: String
});

module.exports = mongoose.model('History', historyPost);
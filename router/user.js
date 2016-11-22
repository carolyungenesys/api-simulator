var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var userPost = new Schema({
    username: String,
    password: String
});

userPost.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userPost.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userPost.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userPost);
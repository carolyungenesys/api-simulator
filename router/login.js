var express = require('express');
var router = express.Router();
var passport = require('passport');
var flash = require('connect-flash');
// var setuppassport = require('./passport.js');
var User = require('./user.js')
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;
//modules to store session
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bcrypt = require('bcrypt-nodejs');

//session secret
router.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
//flash warning
router.use(flash());
router.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
}); 
//init passport authentication
router.use(passport.initialize());
//presistent login sessions
router.use(passport.session());
passport.serializeUser(function(User, done) {
	done(null, User._id);
});
// deserialize user
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, User) {
		done(err, User);
	});
});

passport.use("local-login",new LocalStrategy(function(username, password, callback) {
	User.findOne({username: username}, function(err, user) {
		if (err) { return callback(err); }
		if (!user) {
			console.log("can't find user");
			return callback(null, false);
		}
		if (!user.validPassword(password)) {
			console.log("wrong password");
		return callback(null, false);
		}
		return callback(null, user);
	});
})); 

passport.use("local-signup",new LocalStrategy(function(username, password, callback) {
	User.findOne({ username: username }, function(err, user) {
		if (err) { return next(err); }
		if (user) {
			console.log('Existing User');
			return callback(null, false);
		}else{
			console.log('signup');
			var newUser = new User();
			newUser.username = username;
			newUser.password = newUser.generateHash(password);
			newUser.save();
		}
		return callback(null, newUser);
	});
})); 

// function to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
    return next();
    }
    req.flash("info", "You must be logged in to see this page.");
    res.redirect('/login');
}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
//login success
router.get('/profile', isLoggedIn, function(req, res){
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
            res.render('profile.ejs',{
            	testcases: testcases,
                user: req.user
            });
        }
    });
});

//logout
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

router.get('/signup', function(req, res){
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
            res.render('signup.ejs',{
                testcases: testcases
            });
		}
    });
});

//login
router.get('/login', function(req, res){
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
            res.render('login.ejs',{
                testcases: testcases
            });
		}
    });
});

router.post("/signup", passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.post('/login',passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

module.exports = router;
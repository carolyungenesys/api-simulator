var express = require('express');
var router = express.Router();
var passport = require('passport');
var fs = require('fs');
var flash = require('connect-flash');
var User = require('./user.js');
var scheduler = require('./scheduler.js');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;
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
    successRedirect : '/profile/info', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.post('/login',passport.authenticate('local-login', {
    successRedirect : '/profile/info', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));


router.get('/profile/info', isLoggedIn, function(req, res){
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
			var startTime = [];
			var preScript = [];
			var command = [];
			var postScript = [];
			var log = [];
			scheduler.find({owner: req.user.username}, function(err, obj){
				for (var i=0; i<obj.length; i++){
					startTime.push(obj[i]['startTime']);
					preScript.push(obj[i]['preScript']);
					command.push(obj[i]['command']);
					postScript.push(obj[i]['postScript']);
					log.push(obj[i]['log']);
				}
				res.render('profile.ejs',{
	            	testcases: testcases,
	                user: req.user,
	                type: 'info',
	                startTime: startTime,
	                preScript: preScript,
	                command: command,
	                postScript: postScript,
	                log: log
	            });
			});
        }
    });
});

router.get('/profile/scheduler', isLoggedIn, function(req, res){
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
                user: req.user,
                type: 'scheduler'
            });
        }
    });
});

router.get('/profile/logs/:log', isLoggedIn, function(req, res){
    var testcases = [];
    var log = req.params.log;
	caseModel.find({}, function(err,obj){
		if (err){
			logger.error(err);
		}
		if (obj == null){
			res.status(404).send('No recording found');
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
			fs.readFile('./public/user/'+req.user.username+"/"+log, function(err,data){
				if (err) throw err;
				data = data.toString();
				res.render('profile.ejs',{
	            	testcases: testcases,
	                user: req.user,
	                type: 'logs',
	                logfile: log,
	                log: data
	            });
			});
        }
    });
});

router.post('/profile/changepassword', isLoggedIn, function(req, res){

});

router.post('/profile/scheduler', isLoggedIn, function(req, res){
	var newScheduler = new scheduler();
		newScheduler.owner = req.user.username;
		newScheduler.startTime = req.body.startTime;
		newScheduler.preScript = req.body.preScript;
		newScheduler.command = req.body.command;
		newScheduler.postScript = req.body.postScript;
		newScheduler.log = req.body.log;
	newScheduler.save();
	res.redirect('/profile/info');
});

module.exports = router;
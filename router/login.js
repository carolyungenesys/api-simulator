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
var exec = require('child_process').exec;

router.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

router.use(flash());
router.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
}); 

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(User, done) {
	done(null, User._id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, User) {
		done(err, User);
	});
});

passport.use("local-login",new LocalStrategy(function(username, password, callback) {
	User.findOne({username: username}, function(err, user) {
		if (err) { return callback(err); }
		if (!user) {
			logger.info("USER: can't find user "+user['username']);
			return callback(null, false);
		}
		if (!user.validPassword(password)) {
			logger.info("USER: "+user['username']+" wrong password");
			return callback(null, false);
		}
		logger.info("USER: "+user['username']+" login success");
		return callback(null, user);
	});
})); 

passport.use("local-signup",new LocalStrategy(function(username, password, callback) {
	User.findOne({ username: username }, function(err, user) {
		if (err) { return next(err); }
		if (user) {
			logger.info("USER: Existing user: "+user['username']);
			return callback(null, false);
		}else{
			logger.debug("USER: Creating user: "+user['username']);
			var newUser = new User();
			newUser.username = username;
			newUser.password = newUser.generateHash(password);
			newUser.save();
		}
		logger.info("USER: "+user['username']+" sign up success");
		return callback(null, newUser);
	});
})); 

User.find({username: "admin"}, function(err, obj){
	if (err){
		logger.error(err);
	}
	if (obj.length == 0){
		var newUser = new User();
			newUser.username = 'admin';
			newUser.password = newUser.generateHash('admin');
		newUser.save(function(err){
			if (err){
				logger.error(err);
			}
			logger.info("USER: initialize admin success");
		});	
	}
});


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
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
            res.render('signup.ejs',{
            	user: "Login",
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
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
            res.render('login.ejs',{
            	user: "Login",
                testcases: testcases
            });
		}
    });
});

router.post("/signup", passport.authenticate('local-signup', {
    successRedirect : '/profile/info', 
    failureRedirect : '/signup',
    failureFlash : true
}));

router.post('/login',passport.authenticate('local-login', {
    successRedirect : '/profile/info',
    failureRedirect : '/login',
    failureFlash : true
}));


router.get('/profile/info', isLoggedIn, function(req, res){
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
			var startTime = [];
			var preScript = [];
			var command = [];
			var postScript = [];
			var log = [];
			var status = [];
			scheduler.find({owner: req.user.username}, function(err, obj){
				for (var i=0; i<obj.length; i++){
					startTime.push(obj[i]['startTime']);
					preScript.push(obj[i]['preScript']);
					command.push(obj[i]['command']);
					postScript.push(obj[i]['postScript']);
					log.push(obj[i]['log']);
					status.push(obj[i]['status']);
				}
				res.render('profile.ejs',{
	            	testcases: testcases,
	                user: req.user.username,
	                type: 'info',
	                startTime: startTime,
	                preScript: preScript,
	                command: command,
	                postScript: postScript,
	                log: log,
	                status: status
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
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
            res.render('profile.ejs',{
            	testcases: testcases,
                user: req.user.username,
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
		if (obj.length == 0){
			logger.debug('Initialization needed.');
			res.status(404).send(new Buffer('<p>No Testcases found. Please initialize DB.</p>'));
		}else{
			for (var i=0; i<obj.length; i++){
				testcases.push(obj[i]['case_id']);
			}
			var logs = [];
			scheduler.find({owner: req.user.username}, function(err, obj){
				for (var i=0; i<obj.length; i++){
					logs.push(obj[i]['log']);
				}
				if (log == 'list'){
					log = logs[0];
				}
				fs.readFile('./public/user/'+req.user.username+"/"+log, function(err,data){
					if (err){
						logger.error(err);
						res.render('error.ejs',{
							user: req.user.username,
							testcases: testcases,
							code: '404',
							msg: "Can't find log file." 
						});
					}else{
						data = data.toString();
						res.render('profile.ejs',{
			            	testcases: testcases,
			                user: req.user.username,
			                type: 'logs',
			                logfile: log,
			                log: data,
			                logs:logs
			            });
					}
				});
			});
        }
    });
});

router.post('/profile/changepassword', isLoggedIn, function(req, res){
	User.findOne({username: req.user.username}, function(err,result){
		if (err) throw err;
		var newpwd = result.generateHash(req.body.newpwd);
		logger.debug('DB: user id: '+result._id);
		logger.debug('newpwd: '+newpwd);
		User.update({_id:result._id}, {password: newpwd}, function(err, user){
			if (err) throw err;
			logger.debug(user);
		});
		res.redirect('/profile/info');
	});
});

router.post('/profile/scheduler', isLoggedIn, function(req, res){
	var startTime = new Date(req.body.startTime);
	startTime = startTime.getTime();
	var now = new Date().getTime();
	logger.debug('Now is '+now+", schedule at "+startTime);
	if (startTime >= now){
		var schedule = startTime-now;
		logger.info('Scheduled command '+req.body.command+' after '+schedule+' ms');
		var newScheduler = new scheduler();
			newScheduler.owner = req.user.username;
			newScheduler.startTime = req.body.startTime;
			newScheduler.preScript = req.body.preScript;
			newScheduler.command = req.body.command;
			newScheduler.postScript = req.body.postScript;
			newScheduler.log = req.body.log;
			newScheduler.status = 'NOT RUN';
		newScheduler.save(function(err, scheduled){
			res.redirect('/profile/info');
			setTimeout(function(){
				var cmd = req.body.preScript+" "+req.body.command+" "+req.body.postScript+" >" +req.body.log;
				logger.debug(cmd);
				logger.debug("DB: test id->"+scheduled._id);
				exec(cmd, function(error){
					if (error){
						scheduler.update({_id: scheduled._id}, {status: 'BUILD FAIL'}, function(err){
							if (err) throw err;
						});
						logger.error('SCHEDULER: Build Fail '+error);
					}else{
						scheduler.update({_id: scheduled._id}, {status: 'BUILD SUCCESS'}, function(err){
							if (err) throw err;
						});
						logger.info('SCHEDULER: Build Success '+req.body.command);
					}
				});
			}, schedule);
		});
	}else{
		logger.error('Invalid scheduler');
		res.redirect('/profile/scheduler');
	}
});

module.exports = router;
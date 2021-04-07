// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var webSocketPort = port+1;

var express = require('express');
var app = express();

const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html
app.use('/',express.static('static_files')); // this directory has files to be returned

app.use('/',express.static('static_content')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

// Web Sockets
var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: webSocketPort});
   

var messages=[];
   
const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

function isObject(o){ return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth/login', function (req, res,next) {

	//Verify that the correct method and headers are being received
	if (!req.method || req.method != "POST") {
		return res.status(403).json({ error: 'Invalid method type, please use POST for login' });
	}
	if (!req.headers.username || !req.headers.password) {
		return res.status(403).json({ error: 'Please enter both a username and a password' });
  	}

	try {
		//Regex match the username and password to a valid username and password.
		//That is, usernames are only digits and alphabet letters. Passwords are special characters & letters. 
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname) //Only A-Z, a-z, 0-9, and the underscore
		var p = /(([\w]|[\W])*)$/.exec(req.headers.password);
		var pword = Buffer.from(p[1], 'base64').toString();
		p = /(([\w]|[\W])*)$/.exec(pword); //Alphabet, digits, and any special character
		
		var username = u[1];
		var password = p[1];

		//Query database for specified username and password
		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        pool.query(sql, [username, password], (err, pgRes) => {
  			if (err){
                res.status(403).json({ error: 'Your username or password is incorrect.'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
                res.status(403).json({ error: 'Your username or password is incorrect.'});
        	}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Your username or password is incorrect.'});
	}
});

app.use('/api/auth/profile', function (req, res,next) {
	
	//Verify that the correct method and headers are being received
	if (!req.method || req.method != "GET") {
		return res.status(403).json({ error: 'Invalid method type, please use GET for profile' });
	}
	if (!req.headers.username) {
		return res.status(403).json({ error: 'User not specified' });
  	}

	try {
		//Regex match the username to a valid username.
		//That is, usernames are only digits and alphabet letters.
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname); //Only A-Z, a-z, 0-9, and the underscore
		var username = u[1];

		if (username == null || username == '' || username.length > 20) {
			return res.status(403).json({error : "Valid user was not specified."});
		}

		//We query the username to ensure the user that was specified from the controller's call exists.
		let sql = 'SELECT * FROM ftduser WHERE username=$1';
        pool.query(sql, [username], (err, pgRes) => { //Nested SQL callback
  			if (err){
                res.status(403).json({ error: 'Your username or password is incorrect.'});
			} else if(pgRes.rowCount == 1){ //User exists, so get their information from the database
				return res.status(200).json(pgRes.rows[0])
			} else {
                res.status(403).json({ error: 'Your username or password is incorrect.'});
        	}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Your username or password is incorrect.'});
	}
});

app.use('/api/auth/updateScore', function (req, res,next) {
	
	//Verify that the correct method and headers are being received
	if (!req.method || req.method != "PUT") {
		return res.status(403).json({ error: 'Invalid method type, please use PUT for updating score' });
	} else if (!req.headers.username) {
		return res.status(403).json({ error: 'Username for score update not specified' });
  	} else if (!req.headers.score) {
		return res.status(403).json({ error: 'Score parameter not specified. Cannot update score.' });
	}

	try {
		//Regex match the username to a valid username.
		//That is, usernames are only digits and alphabet letters. 
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname); //Only A-Z, a-z, 0-9, and the underscore
		var username = u[1];
		var score = req.headers.score;

		//Ensure the user specified from the model/controller's updatescore call exists.
		let sql = 'SELECT * FROM ftduser WHERE username=$1';
        pool.query(sql, [username], (err, pgRes) => {
  			if (err){
                res.status(403).json({ error: 'Your username is invalid; cannot update score'});
			} else if(pgRes.rowCount == 1){
				let sql_insert = 'UPDATE ftduser SET score=$2 WHERE username=$1';
				pool.query(sql_insert, [username,score], (err) => { if(err) {
					res.status(500).json({ error: 'Something went wrong when we tried to update the score.'});
				} else {
					res.status(200).json({"message" : "Successfully updated score!"})
				}});
			} else {
                res.status(401).json({ error: 'Authentication is invalid; cannot update score'});
        	}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Your username is invalid; cannot update score'});
	}
});

app.use('/api/auth/updateUsername', function (req, res, next) {

	if (!req.method || req.method != "PUT") {
		return res.status(403).json({ error: 'Invalid method type, please use PUT for updating username' });
	} else if (!req.headers.username) {
		return res.status(403).json({ error: 'New username not specified' });
	} else if (!req.headers.oldusername) {
		return res.status(403).json({ error: 'Current username not specified' });
	}
	try {
		//Regex match the new username and password to a valid username.
		//That is, usernames are only digits and alphabet letters.
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname); //Only A-Z, a-z, 0-9, and the underscore
		var username = u[1];

		var oldu = /(([\w]|[\W])*)$/.exec(req.headers.oldusername);
		var olduname = Buffer.from(oldu[1], 'base64').toString();
		oldu = /(([\w])*)$/.exec(olduname); //Only A-Z, a-z, 0-9, and the underscore
		var oldUsername = oldu[1];

		if (username == null || username == '' || username.length > 20) {
			return res.status(403).json({error : "Please enter a valid username. \
			Usernames must be unique and less than 20 characters long."});
		}

		let sql = 'SELECT * FROM ftduser WHERE username=$1';
        	pool.query(sql, [oldUsername], (err, pgRes) => {
  			if (err){
                return res.status(403).json({error : "Please enter a valid username. \
				Usernames must be unique and less than 20 characters long."});
			} else if(pgRes.rowCount == 1){
				let sql_insert = 'UPDATE ftduser SET username=$2 WHERE username=$1';
				pool.query(sql_insert, [oldUsername,username], (err));

				res.status(200).json({ 'message': 'Success. Username updated.', 'username': username});
			} else {
				return res.status(403).json({error : "Please enter a valid username. \
				Usernames must be unique and less than 20 characters long."});
        	}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Your username or password is incorrect.'});
	}
});

app.use('/api/auth/updateEmail', function (req, res, next) {

	if (!req.method || req.method != "PUT") {
		return res.status(403).json({ error: 'Invalid method type, please use PUT for updating email' });
	} else if (!req.headers.email) {
		return res.status(403).json({ error: 'New email not specified' });
	} else if (!req.headers.username) {
		return res.status(403).json({ error: 'Current username not specified' });
	}
	try {
		//Regex match the current username and password to a valid username.
		//That is, usernames are only digits and alphabet letters.
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname); //Only A-Z, a-z, 0-9, and the underscore
		var username = u[1];

		//Emails are digits & letters.
		var e = /(([\w]|[\W])*)$/.exec(req.headers.email);
		var mail = Buffer.from(e[1], 'base64').toString();
		//Only letters, 0-9, hyphen, period, underscore, plus, and @ sign
		e = /(([\w]|[\.]|[\+]|[\-])*@([\w]|[\.]|[\+]|[\-])*)$/.exec(mail) ;
		var email = e[1];

		if (email == null || email == '' || email.length > 78) {
			return res.status(403).json({error : "Please enter a valid email. Emails must be less than 78 \
			characters long"});
		}

		if (username == null || username == '' || username.length > 20) {
			return res.status(403).json({error : "Current username specified is invalid. Please log in as a valid user."});
		}
		let sql = 'SELECT * FROM ftduser WHERE username=$1';
		pool.query(sql, [username], (err, pgRes) => {
			if (err){
				return res.status(403).json({error : "Please enter a valid email. Emails must be less than 78 \
				characters long"});	
			} else if(pgRes.rowCount == 1){
				let sql_insert = 'UPDATE ftduser SET email=$2 WHERE username=$1';
				pool.query(sql_insert, [username,email], (err));
				res.status(200).json({ 'message': 'Success. Username updated.', 'email': email});
			} else {
				return res.status(403).json({error : "Please enter a valid email. Emails must be less than 78 \
				characters long"});
			}
		});
	} catch(err) {
			return res.status(403).json({error : "Please enter a valid email. Emails must be less than 78 \
			characters long"});
	}
});

app.use('/api/register', function (req, res,next) {

	if (!req.method || req.method != "POST") {
		return res.status(403).json({ error: 'Invalid method type, please use POST for registration' });
	}
	if (!req.headers.username || !req.headers.password || 
		!req.headers.email || !req.headers.firstname || !req.headers.lastname) {
		return res.status(403).json({ error: 'Please fill out all fields' });
  	}
	try {
		//Regex match ALL FIELDS to be valid
		//That is, usernames are only digits and alphabet letters with two exceptions, dots and underscore.  
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString()
		u = /(([\w]|[\.])*)$/.exec(uname) //Only A-Z, a-z, 0-9, the underscore, and a dot

		//Passwords are special characters & letters.
		var p = /(([\w]|[\W])*)$/.exec(req.headers.password);
		var pword = Buffer.from(p[1], 'base64').toString()
		p = /(([\w]|[\W])*)$/.exec(pword) //Alphabet, digits, and any special character

		//Emails are digits & letters.
		var e = /(([\w]|[\W])*)$/.exec(req.headers.email);
		var mail = Buffer.from(e[1], 'base64').toString();
		//Only letters, 0-9, hyphen, period, underscore, plus, and @ sign
		e = /(([\w]|[\.]|[\+]|[\-])*@([\w]|[\.]|[\+]|[\-])*)$/.exec(mail);

		//First names are only alphabet characters
		var f = /(([\w]|[\W])*)$/.exec(req.headers.firstname);
		var fname = Buffer.from(f[1], 'base64').toString();
		f = /(([A-Z]|[a-z])*)$/.exec(fname); //Only A-Z, a-z

		//Last names are only alphabet characters
		var l = /(([\w]|[\W])*)$/.exec(req.headers.lastname);
		var lname = Buffer.from(l[1], 'base64').toString();
		l = /([A-Za-z]*)$/.exec(lname); //Only A-Z, a-z

		var username = u[1];
		var password = p[1];
		var email = e[1];
		var firstname = f[1];
		var lastname = l[1];

		if (username == null || username == '' || username.length > 20) {
			return res.status(403).json({error : "Please enter a valid username. Usernames must be unique and less than 20 characters long."});
		} else if (password == null || password == '' || password.length > 20 || password.length < 6) {
			return res.status(403).json({error : "Please enter a valid password. Passwords must be between 6 and 20 characters long."});
		} else if (email == null || email == '' || email.length > 78) {
			return res.status(403).json({error : "Please enter a valid email. Emails must be less than 78 characters long"});
		} else if (firstname == null || firstname == '' || firstname.length > 20) {
			return res.status(403).json({error : "Please enter a valid first name strictly in the english alphabet and less than 20 characters in length."});
		} else if (lastname == null || lastname == '' || lastname.length > 20) {
			return res.status(403).json({error : "Please enter a valid last names strictly in the english alphabet and less than 20 characters in length."});
		}

		let sql_check = 'SELECT * FROM ftduser WHERE username=$1';
        	pool.query(sql_check, [username], (err, pgRes) => {
  			if (err){
                res.status(403).json({ error: 'Please enter a valid username and password'});
			} else if(pgRes.rowCount >= 1){
				res.status(403).json({ error: 'User already exists. Please enter a unique username.'});
			} else {
				let sql_insert = 'INSERT INTO ftduser (username, password, email, firstname, lastname) \
				VALUES ($1, sha512($2), $3, $4, $5)';
				pool.query(sql_insert, [username, password, email, firstname, lastname], (err));
				next(); 	
        	}
		});
	} catch(err) {
		
        res.status(403).json({ error: 'Please ensure all fields are valid'});
	}

});

app.use('/api/auth/delete', function (req, res, next) {

	if (!req.method || req.method != "DELETE") {
		return res.status(403).json({ error: 'Invalid method type, please use DELETE for deleting user' });
	} else if (!req.headers.username) {
		return res.status(403).json({ error: 'username not specified' });
	}

	try {
		//Regex match the new username and password to a valid username.
		//That is, usernames are only digits and alphabet letters.
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname); //Only A-Z, a-z, 0-9, and the underscore
		var username = u[1];

		let sql = 'SELECT * FROM ftduser WHERE username=$1';
        	pool.query(sql, [username], (err, pgRes) => {
  			if (err){
                return res.status(403).json({error : "Could not delete user. (Are you authenticated?)"});
			} else if(pgRes.rowCount == 1){
				let sql_delete = 'DELETE FROM ftduser WHERE username=$1';
				pool.query(sql_delete, [username], (err));
				res.status(200).json({'message': 'Success. User deleted.'});
			} else {
				return res.status(403).json({error : "Could not delete user. (Are you authenticated?)"});
        	}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Could not delete user. (Are you authenticated?)'});
	}
});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.get('/api/auth/profile', function (req, res) {
	res.status(200); 
	res.json({"message":"profile information extraction success"}); 
});

app.delete('/api/auth/delete', function (req, res) {
	res.status(200); 
	res.json({"message":"profile deletion success"}); 
});

app.put('/api/auth/updateScore', function (req, res) {
	res.status(200); 
	res.json({"message":"score update success"}); 
});

app.put('api/auth/updateUsername', function (req, res) {
	res.status(200); 
	res.json({"message":"username update success"}); 
});

app.post('/api/register', function (req, res) {
	res.status(200);
	res.json({"message":"successfully registered user"});
});

app.post('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});


//Web socket stuff below

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
	for(let ws of this.clients){ 
		ws.send(message); 
	}

	// Alternatively
	// this.clients.forEach(function (ws){ ws.send(message); });
}

var j = 0;
var touchesList = [];
wss.on('connection', function(ws) {
	var i;
	for(i=0;i<messages.length;i++){
		ws.send(messages[i]);
	}
	var red = Math.round(Math.random()*255);
	var green = Math.round(Math.random()*255);
	var blue = Math.round(Math.random()*255);
	
	ws.clientNum = j;
	j++;

	ws.on('message', function(message) {
		message = [
			{
				color: [red, green, blue],
				touches: JSON.parse(message)
			}
		];
		touchesList[ws.clientNum] = message[0];

		for (var k = 0; k < j; k++){
			if (k != ws.clientNum){
				message.push(touchesList[k]);
			}
		}


		console.log(JSON.stringify(message));
		ws.send(JSON.stringify(message)); 
		wss.broadcast(JSON.stringify(message));
		messages.push(JSON.stringify(message));
	});

	ws.on("close", () => {
		console.log("client disconnected");
	});
});




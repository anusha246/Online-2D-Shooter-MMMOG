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
app.use('/api/auth/getScores', function (req, res,next) {
	
	//Verify that the correct method and headers are being received
	if (!req.method || req.method != "GET") {
		return res.status(403).json({ error: 'Invalid method type, please use GET to view leaderboard' });
	} else if (!req.headers.username) {
		return res.status(403).json({ error: 'You must be authenticated to view leaderboards' });
  	}

	try {
		//Regex match the username to a valid username.
		//That is, usernames are only digits and alphabet letters. 
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString();
		u = /(([\w])*)$/.exec(uname); //Only A-Z, a-z, 0-9, and the underscore
		var username = u[1];

		//Grab all users for compiling leaderboard
		let sql = 'SELECT * FROM ftduser WHERE score > 0 ORDER BY score DESC';
        pool.query(sql, (err, pgRes) => {
  			if (err){
                res.status(501).json({ error: 'Internal server error'});
			} else if(pgRes.rowCount >= 1){
					res.status(200).json({"message" : pgRes.rows, "playerCount" : pgRes.rowCount})
			} else {
                res.status(404).json({ error: 'Leaderboard cannot be compiled: no users have played the game'});
        	}
		});
	} catch(err) {
        res.status(403).json({ error: 'You must be authenticated to view leaderboards'});
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

app.get('/api/auth/getScores', function (req, res) {
	res.status(200); 
	res.json({"message":"profile information extraction success"}); 
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
//Game stuff below
function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

function updateScore(score) {



		credentials =  { 
			"username": "user1"
		};

		$.ajax({

			method: "PUT",
			url: "/api/auth/updateScore",
			data: JSON.stringify({}),
			headers: { "PUT": "Score information", "username" : btoa(credentials.username), "score" : score },
			//headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"

		}).done(function(data, text_status, jqXHR){
			
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 

		}).fail(function(err){

			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

		}); 	
	
}

class Stage {
	constructor(){
	
		this.actors=[]; // all actors on this stage (monsters, players, boxes, ...)
		this.players = []; //all players on this stage
		//this.player=null; // a special actor, the player
		this.isGameDone = false;
	
		// the logical width and height of the stage
		this.width=800;
		this.height=800;
		
		this.score;
		//Starter values for both player and opponents
		var velocity = new Pair(0,0);
		var radius = 18;
		var aim_pos = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		var turret_pos = new Pair(Math.floor(this.width/2), Math.floor(this.height/2) - radius);
		var health = 10;
		var ammo = 10;
		var gunType = "Pistol";
		
		
		//Create opponents
		var num_opponents = 3;
		for (var i=0; i<num_opponents; i++){
			
			var colour= 'rgba(255,0,0,1)';
			var opponent_pos = new Pair(Math.floor((Math.random()*this.width)), 
										Math.floor((Math.random()*this.height)));
										
			//Random integers in range code below from
			//https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
			//Set move_time a random int between 1 and 200
			var move_time = Math.floor(Math.random() * (200 - 1 + 1)) + 1;
			
			this.addActor(new Opponent(this, "Opponent", opponent_pos, velocity, colour, 
										radius, aim_pos, turret_pos, health, ammo, 
										move_time, gunType));
		}
		
		
		
		
	
		// Generate Boxes
		this.numBoxes=20;
		this.generateBoxes(this.numBoxes);
		
	}

	addPlayer(colour){
		//Create player
		
		var velocity = new Pair(0,0);
		var radius = 18;
		this.midPosition = new Pair(Math.floor((Math.random()*this.width)), 
									Math.floor((Math.random()*this.height)));
		var aim_pos = this.midPosition;
		var turret_pos = new Pair(this.midPosition.x, this.midPosition.y - radius);
		var health = 10;
		var ammo = 10;
		var gunType = "Pistol";
		
		var score = 0;
		var colour= colour;
		
		
		var player = new Player(this, "Player", this.midPosition, velocity, colour, radius,
								aim_pos, turret_pos, health, ammo, score, gunType);
		
		
		
		this.addActor(player);
		this.players.push(player);
		//this.player = player;
	}
	
	/*
	noPlayers(){
		
	}
	*/

	removePlayer(player){
		this.players[this.players.indexOf(player)] = null;
		this.removeActor(player);
		//this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  
	//Do this by asking each of the actors to take a single step. 
	step(){
		//Loop through actors list
		for(var i=0;i<this.actors.length;i++){
			
			//If actor can take a step, do it 
			if (typeof this.actors[i].step == 'function'){
				
				var shouldStep = true;
				
				//Loop through actors list to check for collisions
				for(var j=0;j<this.actors.length;j++){
					
					//If the player is dead or all opponents are dead
					//or object is colliding with something else
					if (!this.actors[i].shouldStep(this.actors[j])){
							
						shouldStep = false;
						
						/*
						//If a bullet hits a player or opponent it was not shot from
						if (this.actors[i].constructor.name == "Bullet" &&
							this.actors[j].constructor.name != "Box" &&
							this.actors[i].shotFrom != this.actors[j].constructor.name){
							
							//If bullet was shot from player, update player score
							if (this.actors[i].shotFrom.substring(0, 6) == "Player") {
								if (this.players[parseInt(this.actors[i].shotFrom.substring(6, 
															this.actors[i].shotFrom.length))]){
									
									this.players[parseInt(this.actors[i].shotFrom.substring(6, 
													this.actors[i].shotFrom.length))].score++;
								}									
								//this.player.score++;
								//updateScore(this.player.score);
							}
						}
						*/
						
						break;
					}
				}
				
				//If actor is not colliding with anything, step
				if(shouldStep){
					this.actors[i].step();
					
					if (this.actors[i].constructor.name == "Opponent"){
						
						for (var j=0; j<this.players.length; j++){
							if (this.players[j]){
								this.actors[i].attack(this.players[j]);
							}
						}
					
					//If actor is a player, adjust its aim position
					//based on its velocity
					} else if (this.actors[i].myClass == "Player"){
						
						this.actors[i].aim_pos.x += this.actors[i].velocity.x;
						this.actors[i].aim_pos.y += this.actors[i].velocity.y;
						
						this.actors[i].turret_pos.x=(this.actors[i].aim_pos.x - this.actors[i].x);
						this.actors[i].turret_pos.y=(this.actors[i].aim_pos.y - this.actors[i].y);
						this.actors[i].turret_pos.normalize();
						
						this.actors[i].turret_pos.x = this.actors[i].turret_pos.x * this.actors[i].radius + this.actors[i].x;
						this.actors[i].turret_pos.y = this.actors[i].turret_pos.y * this.actors[i].radius + this.actors[i].y;
						
						
						
					} 
					
					
				} 
					
						
				
			}
			
			//If Bullet, decrease lifetime by 1
			if ((this.actors[i].constructor.name) == "Bullet"){
				this.actors[i].lifetime -= 1;
				
				
				//If Bullet's lifetime reaches 0, delete it
				if (this.actors[i].lifetime <= 0){
					this.removeActor(this.actors[i]);
				}
			}
			
			//If actor exists and has health, remove it if health is 0
			if (this.actors[i] && typeof this.actors[i].health == 'number'){
				if (this.actors[i].health <= 0){
					
					//Save score and position in case of player death
					this.score = this.actors[i].score;
					this.midPosition = this.actors[i].position;
					
					//Remove player or opponent whose health is 0
					if (this.actors[i].myClass == "Player"){
						this.removePlayer(this.actors[i]);
					} else {
						this.removeActor(this.actors[i]);
					}
				}
			}
			
			//If there are no more boxes on canvas, generate more
			if (!this.actors.some(Object => Object.constructor.name == "Box")){
						
				this.generateBoxes(this.numBoxes);
			} 
			
			/*
			//If there is no player or no opponents on canvas, game is done
			if (this.player == null || 
				!this.actors.some(Object => Object.constructor.name == "Opponent")){
						
				this.isGameDone = true;
				break;
			} 
			*/
			
		}
		
	}

	

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
	
	//Generate numBoxes Boxes randomly placed and sized on canvas
	generateBoxes(numBoxes){
		while(numBoxes>0){
			
			//Get random x and y position based on canvas size
			var x=Math.floor((Math.random()*(this.width-200))); 
			var y=Math.floor((Math.random()*(this.height-200))); 
			
			//If an actor does not exist at (x, y) position
			if(this.getActor(x,y)===null){
				
				var red=randint(255), green=randint(255), blue=randint(255);
				
				//Random integers in range code below from
				//https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
				//Set width and height values between 5 and 200 inclusive
				var width = Math.floor(Math.random() * (200 - 5 + 1)) + 5;
				var height = Math.floor(Math.random() * (200 - 5 + 1)) + 5;
				
				var colour= 'rgba('+red+','+green+','+blue+','+0.75+')';
				var position = new Pair(x,y);
				var health = 3;
				var type = "Ammo";
				
				//Randomly make a Box a gun box based on gunSpawn value
				var gunSpawn = Math.floor(Math.random()*10);
				if (gunSpawn == 0){
					type = "Pistol";
					health = 100;
				} else if (gunSpawn == 1){
					type = "Sniper";
					health = 100;
				} else if (gunSpawn == 2){
					type = "Shotgun";
					health = 100;
				}
					
				//Add Box to actors
				var b = new Box(this, "Box", position, colour, width, height, health, type);
				this.addActor(b);
				numBoxes--;
			}
		}
	}
		
	
	

} // End Class Stage

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
	
	//Scale a Pair by num's value
	multiply(num){
		this.x = this.x * num;
		this.y = this.y * num;
	}
}

class Box {
	constructor(stage, myClass, position, colour, width, height, health, type){
		this.stage = stage;
		this.myClass = myClass;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.colour = colour;
		this.width = width;
		this.height = height;
		this.health = health;
		this.type = type;
		
		if (this.type == "Pistol"){
			this.colour = "blue";
		} else if (this.type == "Sniper"){
			this.colour = "yellow";
		} else if (this.type == "Shotgun"){
			this.colour = "red";
		}
	}
	
	toString(){
		return this.position.toString();
	}
	
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	
}


class Ball {
	constructor(stage, myClass, position, velocity, colour, radius){
		this.stage = stage;
		this.myClass = myClass;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
	}
	
	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}
	
	//Returns true if this is not going into object, false otherwise
	shouldStep(object){
		if (object.constructor.name == "Box"){
			
			//If going inside Box
			if (this.position.x + this.velocity.x > object.position.x && 
				this.position.x + this.velocity.x < object.position.x + object.width &&
				this.position.y + this.velocity.y > object.position.y &&
				this.position.y + this.velocity.y < object.position.y + object.height){
				
				//If this is a Bullet, decrease object (Box) health
				//and expire Bullet
				if (this.constructor.name == "Bullet"){
					object.health--;
					this.lifetime = 0;
				
				//Actor is a Player or Opponent, pickup ammo capped at 10
				} else {
					
					//Ammo pickup based on box health, 10 max
					this.ammo += object.health;
					if (this.ammo > 10){
						this.ammo = 10;
					}
					
					//If Box is Sniper or Pistol box
					if (object.type != "Ammo"){
						this.gunType = object.type;
					}
					
					object.health = 0;
				}
					
				
				return false;
			} 
			
			return true;
		
		
		//Else it is object extended from Ball: Bullet, Player, or Opponent
		} else {
						
			if (this != object){
				//If going inside object extended from Ball
				if (this.position.x + this.velocity.x > object.position.x - object.radius && 
					this.position.x + this.velocity.x < object.position.x + object.radius &&
					this.position.y + this.velocity.y > object.position.y - object.radius &&
					this.position.y + this.velocity.y < object.position.y + object.radius){
					
					
					if (this.constructor.name == "Bullet"){
						
						//If Bullet colliding into other Bullet
						if (object.constructor.name == "Bullet"){
							
							if (this.shotFrom != object.shotFrom){
								object.lifetime = 0;
								
							//Friendly bullet, keep moving
							} else {
								return true;
							}
							
						//If bullet was not shot from object, decrease 
						//object health and expire Bullet
						} else if (object.constructor.name != this.shotFrom){
							if (object.myClass == "Player" && this.shotFrom.substring(0, 6) == "Player"){
								
								console.log("Both Player");
								if (stage.players.indexOf(object) != parseInt(this.shotFrom.substring(6, 
																		this.shotFrom.length))){
									console.log("Decrease health");
									stage.players[parseInt(this.shotFrom.substring(6, 
													this.shotFrom.length))].score++;
									//updateScore(stage.players[parseInt(this.shotFrom.substring(6, 
										//this.shotFrom.length))].score);
									object.health--;
									this.lifetime = 0;
								}
								
								
									
							} else {
								if (this.shotFrom.substring(0, 6) == "Player"){
									stage.players[parseInt(this.shotFrom.substring(6, 
													this.shotFrom.length))].score++;
									//updateScore(stage.players[parseInt(this.shotFrom.substring(6, 
										//this.shotFrom.length))].score);
								}
								
								
								object.health--;
								this.lifetime = 0;
								
							}
						} else {
							return true;
						}
						
					
					}
						
					
					return false;
				} 
				
				return true;
			}
		}
		
		return true;
	}

	step(){
		
		//Update position based on velocity
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;
			
			
		// bounce off the canvas walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
		
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	
}

class Player extends Ball {
	
	constructor(stage, myClass, position, velocity, colour, radius, aim_pos, 
				turret_pos, health, ammo, score, gunType){
		
		super(stage, myClass, position, velocity, colour, radius);
		
		this.aim_pos = aim_pos;
		this.turret_pos = turret_pos;
		this.health = health;
		this.ammo = ammo;
		this.score = score;
		this.gunType = gunType;
	}
		
	
}

class Opponent extends Ball {
	
	constructor(stage, myClass, position, velocity, colour, radius, aim_pos, 
				turret_pos, health, ammo, move_time, gunType){
				
		super(stage, myClass, position, velocity, colour, radius);
		
		this.aim_pos = aim_pos;
		this.turret_pos = turret_pos;
		this.health = health;
		this.ammo = ammo;
		
		this.move_time = move_time;
		this.gunType = gunType;
	}
	
	attack(player){
		
		this.turret_pos.x=(this.aim_pos.x - this.x);
		this.turret_pos.y=(this.aim_pos.y - this.y);
		
		this.turret_pos.normalize();
		
		this.turret_pos.x = this.turret_pos.x * this.radius + this.x;
		this.turret_pos.y = this.turret_pos.y * this.radius + this.y;
		
		this.aim_pos = player.position;
		this.move_time--;
		
		//If move_time expired, set new random one, new random velocity
		if (this.move_time <= 0){
			
			//Set a new move_time between 100 and 200
			this.move_time = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
			
			var new_x_vel = Math.floor(Math.random() * (2 - (-2) + 1)) + (-2);
			var new_y_vel = Math.floor(Math.random() * (2 - (-2) + 1)) + (-2);
			
			this.velocity = new Pair(new_x_vel, new_y_vel);
		}

		
		//Randomly shoot bullet from turret towards player
		if (Math.floor(Math.random()*200) == 0){
			
			//If opponent has ammo, shoot a bullet from turret, decrease ammo count
			if (this.ammo > 0){
				
				var bullet_pos_x = this.turret_pos.x;
				var bullet_pos_y = this.turret_pos.y + 1;
				
				this.stage.addActor(new Bullet(this.stage, "Bullet", new Pair(bullet_pos_x, bullet_pos_y), 
											player.position, new Pair(0, 0), 
											'rgba(255,0,0,1)', 3,
											"Opponent", this.gunType));
											
				
				this.ammo--;
				
			}
		}
		
		//console.log("This opp turret_pos: " + this.turret_pos + " position: " + this.position);
		//console.log("Second opp turret_pos: " + stage.actors[1].turret_pos + " name: " + stage.actors[1].myClass);
		//console.log("Third opp turret_pos: " + stage.actors[2].turret_pos + " name: " + stage.actors[2].myClass);
		
		
		
		
	}
	
	
	
}

class Bullet extends Ball {
	constructor(stage, myClass, position, aim_pos, velocity, colour, radius, 
				shotFrom, type){
		super(stage, myClass, position, velocity, colour, radius);
		
		this.lifetime = 100;
		this.shotFrom = shotFrom;
		this.type = type;
		this.aim_pos = aim_pos;
		this.headTo(this.aim_pos);
		this.velocity.multiply(2);
		
		//Set lifetimes and velocities based on gun type
		if (type == "Sniper"){
			this.lifetime = this.lifetime*2;
			this.velocity.multiply(4);
			
		} else if (type == "Shotgun"){
			
			//Create two more bullets
			
			//Getting arc coordinates code from
			//https://stackoverflow.com/questions/12342102/html5-get-coordinates-of-arcs-end
			//Use arc coordinates to set bullet position offset, aim_pos offset
			this.stage.addActor(new Bullet(this.stage, "Bullet",
									new Pair(this.position.x+Math.cos(45*Math.PI/180)*3,
											this.position.y+Math.sin(45*Math.PI/180)*3), 
									new Pair(this.aim_pos.x+Math.cos(45*Math.PI/180)*100,
											this.aim_pos.y+Math.sin(45*Math.PI/180)*100),
									new Pair(0, 0), this.colour, this.radius, this.shotFrom, 
									"Shotgun extra"));
			
			this.stage.addActor(new Bullet(this.stage, "Bullet",
									new Pair(this.position.x-Math.cos(45*Math.PI/180)*3,
											this.position.y-Math.sin(45*Math.PI/180)*3),
									new Pair(this.aim_pos.x-Math.cos(45*Math.PI/180)*100,
											this.aim_pos.y-Math.sin(45*Math.PI/180)*100),
									new Pair(0, 0), this.colour, this.radius, this.shotFrom, 
									"Shotgun extra"));
			
		
		} else if (type == "Pistol"){
			this.velocity.multiply(2);
		}
	}
	
}



//Run game

const getCircularReplacer = () => {
	  
	const seen = new WeakSet();
	
	return (key, value) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value) && value.constructor.name == "Stage") {
				//console.log(value.constructor.name);
				return;
				
			}
			seen.add(value);
		}
		return value;
	};
};

function startGame(){
	//var message = [];
	//message.push(stage);
	//console.log("Player is " + JSON.stringify(stage.player, getCircularReplacer()));
	//message.push(JSON.stringify(stage.player, getCircularReplacer()));



	//console.log(JSON.stringify(stage, getCircularReplacer()));
	//ws.send(JSON.stringify(stage, getCircularReplacer())); 
	//wss.broadcast(JSON.stringify(stage, getCircularReplacer()));
	//messages.push(JSON.stringify(stage, getCircularReplacer()));
	interval=setInterval(function(){ 
		stage.step(); 
		//console.log("First opp turret_pos: " + stage.actors[0].turret_pos + " name: " + stage.actors[0].myClass);
		//console.log("Second opp turret_pos: " + stage.actors[1].turret_pos + " name: " + stage.actors[1].myClass);
		//console.log("Third opp turret_pos: " + stage.actors[2].turret_pos + " name: " + stage.actors[2].myClass);
		
		wss.broadcast(stage);
		//wss.broadcast(JSON.stringify(stage, getCircularReplacer()));
		//messages.push(JSON.stringify(stage, getCircularReplacer()));
	}, 10);
	
	
}

/*
//Animate game if not paused or done
function animate() {

	stage.step();
	
	if (!stage.isGameDone){
		requestAnimationFrame(animate);	
	}

}
*/

//Web socket stuff below

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
	for(let ws of this.clients){ 
		var toSend = [];        
		toSend.push(stage);
		//toSend.push(JSON.stringify(stage.players[ws.clientNum], getCircularReplacer()));
		toSend.push(stage.players[ws.clientNum]);
		//console.log(ws.clientNum);
		//if (stage.players[ws.clientNum]){
		ws.send(JSON.stringify(toSend, getCircularReplacer())); 
		//}
	}

	// Alternatively
	// this.clients.forEach(function (ws){ ws.send(message); });
}

var stage;
var interval;
var j = 0;
var touchesList = [];
wss.on('connection', function(ws) {
	if (j == 0){
		stage = new Stage();
	}
	//console.log(JSON.stringify(stage.player, getCircularReplacer()));
	console.log("Made stage");
	
	/*
	if (j == 0){
		startGame();
	}
	
	console.log("Started game");
	*/
	/*
	var i;
	for(i=0;i<messages.length;i++){
		ws.send(messages[i]);
	}
	*/
	var red = Math.round(Math.random()*255);
	var green = Math.round(Math.random()*255);
	var blue = Math.round(Math.random()*255);
	
	ws.colour = `rgba(${red},${green},${blue},1)`;
	
	ws.clientNum = j;
	j++;
	
	stage.addPlayer(ws.colour);
	
	

	ws.on('message', function(message) {
		//clearInterval(interval);
		//interval=null;
		
		
		//if (JSON.parse(message)
		//console.log(message);
		//console.log("Message: " + message);
		//console.log("Parsed message: " + JSON.parse(message)[0].x);
		
		//console.log("Got message: "+ JSON.parse(message));
		/*
		if (!stage.players[ws.clientNum]){
			stage.addPlayer(ws.colour);
			ws.send(JSON.stringify("Start game"));
		}
		*/
		
			
		if (!interval){
			startGame();
			console.log("Started game");
		}

		if (JSON.parse(message)[0]){
			var PlayerHeadTo = JSON.parse(message)[0];
		
			if (stage.players[ws.clientNum]){
				stage.players[ws.clientNum].headTo(new Pair(PlayerHeadTo.x, PlayerHeadTo.y));
				stage.players[ws.clientNum].velocity.multiply(3);
				
				for (var i = 1; i < JSON.parse(message).length; i++){
					stage.players[ws.clientNum].aim_pos = (new Pair(JSON.parse(message)[i].x, JSON.parse(message)[i].y));
					
					if (stage.players[ws.clientNum].turret_pos.x>=0 && stage.players[ws.clientNum].turret_pos.x<=stage.width &&
					stage.players[ws.clientNum].turret_pos.y>=0 && stage.players[ws.clientNum].turret_pos.y<=stage.height){
						
						//If player has ammo, shoot a bullet from turret, decrease ammo count
						if (stage.players[ws.clientNum].ammo > 0){
							
							var bullet_pos_x = stage.players[ws.clientNum].turret_pos.x;
							var bullet_pos_y = stage.players[ws.clientNum].turret_pos.y + 1;
							stage.addActor(new Bullet(stage, "Bullet", new Pair(bullet_pos_x, bullet_pos_y), stage.players[ws.clientNum].aim_pos,
														new Pair(0, 0), 'rgba(0,255,0,1)', 3, "Player" + ws.clientNum, 
														stage.players[ws.clientNum].gunType));
							stage.players[ws.clientNum].ammo--;

						}
					}
					
				}
			}
			
		} else {
			if (stage.players[ws.clientNum]){
				stage.players[ws.clientNum].velocity = new Pair(0, 0);
			}
		}
		//startGame();
		/*
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
		
		startGame();
		*/

		/*
		console.log(JSON.stringify(message));
		ws.send(JSON.stringify(message)); 
		wss.broadcast(JSON.stringify(message));
		messages.push(JSON.stringify(message));
		*/
		
	});

	ws.on("close", () => {
		console.log("client disconnected");
		stage.removePlayer(stage.players[ws.clientNum]);
	});
});




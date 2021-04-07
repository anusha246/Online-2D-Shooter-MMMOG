var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
var pausedGame = false;
const SPEED = 3;
var loggedIn = false;

//Websocket vars
var socket;
var context;
var allClients = {};

function setupGame(){

	//stage=new Stage(document.getElementById('stage'));

	//Add event listeners for mouse and keyboard events
	document.addEventListener('mousemove', aimByMouse);
	document.addEventListener('click', shootByMouse);
	
	document.addEventListener('keydown', actionByKey);
	document.addEventListener('keyup', stopMoving);

}

function startGame(){
	animate();
}

//Animate game if not paused or done
function animate() {

	stage.step();
	stage.draw();
	
	if (pausedGame) { 
		pauseGame(); 
	} else if (!stage.isGameDone){
		requestAnimationFrame(animate);	
	}

}


function pauseGame(){
	
	//Show pause screen on viewport
	var context = stage.canvas.getContext('2d');
	context.fillStyle = 'rgba(0,0,0,0.5)';
	context.fillRect(-stage.view_width, -stage.view_height, 
					stage.width+stage.view_width + stage.view_width, 
					stage.height+stage.view_height + stage.view_height);		
	context.font = "30px Courier New";
	context.fillStyle = "white";
	context.textAlign = "center";
	context.fillText("Paused", stage.player.position.x, stage.player.position.y);
	context.fillText("Press 'p' to resume", stage.player.position.x, stage.player.position.y + 30);
	
}

//Function code used from 
//https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(event) {

    var rect = stage.canvas.getBoundingClientRect();
	if (!stage.isGameDone){		
		return new Pair((event.clientX - rect.left) / (rect.right - rect.left) * stage.width + stage.player.position.x - stage.width/2,
						(event.clientY - rect.top) / (rect.bottom - rect.top) * stage.height + stage.player.position.y - stage.height/2);
	}
				
}

//Set player velocity with WASD or pause with P
//if game is not done
function actionByKey(event){

	var key = event.key;
	var moveMap = { 
		'a': new Pair(-SPEED,0),
		's': new Pair(0,SPEED),
		'd': new Pair(SPEED,0),
		'w': new Pair(0,-SPEED)
	};
	
	if(!stage.isGameDone){
		if(key in moveMap){
			stage.player.velocity=moveMap[key];
		} else if (key=='p'){
			pausedGame = (!pausedGame);
			if (pausedGame != false){
				pauseGame();
			} else {
				startGame();
			}
		}
	}

}

//Stop player moving
function stopMoving(event){
	if(!stage.isGameDone){
		stage.player.velocity=new Pair(0,0);
	}
}

function aimByMouse(event){
	if(!stage.isGameDone){
		stage.player.aim_pos = getMousePos(event);
	}
}

function shootByMouse(event){
	
	var mouse_pos = getMousePos(event);

	//If game not done and unpaused and turret within canvas
	if (!stage.isGameDone && !pausedGame && 
		stage.player.turret_pos.x>=0 && stage.player.turret_pos.x<=stage.width &&
		stage.player.turret_pos.y>=0 && stage.player.turret_pos.y<=stage.height){
			
		//If player has ammo, shoot a bullet from turret, decrease ammo count
		if (stage.player.ammo > 0){
			
			var bullet_pos_x = stage.player.turret_pos.x;
			var bullet_pos_y = stage.player.turret_pos.y + 1;
			stage.addActor(new Bullet(stage, new Pair(bullet_pos_x, bullet_pos_y), mouse_pos,
										new Pair(0, 0), 'rgba(0,255,0,1)', 3, "Player", 
										stage.player.gunType));
			stage.player.ammo--;

		}
	}
}

function updateTouch (eventType, event) {
	event.preventDefault();

	//relative to the viewport
	var rect = stage.canvas.getBoundingClientRect();
	
	var touches = [];
	if (!stage.isGameDone){
		for (var i = 0; i < event.touches.length ; i++) {
				var touch = event.touches[i];
			touches.push({"x": (touch.clientX - rect.left) / (rect.right - rect.left) * stage.width + stage.player.position.x - stage.width/2, 
							"y":(touch.clientY - rect.top) / (rect.bottom - rect.top) * stage.height + stage.player.position.y - stage.height/2 });
		}
	}
	
	console.log(JSON.stringify(touches));
	socket.send(JSON.stringify(touches));
}

function update(){
	// clear the screen 
	//context.clearRect (0, 0, stage.canvas.width, stage.canvas.height);
	
	for(const c in allClients){
		client = allClients[c];
		
		if (client && client.color) {
			var red=client.color[0];
			var green=client.color[1];
			var blue=client.color[2];

			for (var i = 0; i < client.touches.length ; i++) {
					var touch = client.touches[i];
					context.beginPath ();
					context.arc (touch.x, touch.y, 20, 0, 2 * Math.PI, true);
					
				context.fillStyle = `rgba(${red},${green},${blue},0.2)`;
					context.fill ();
					
					context.lineWidth = 2.0;
					context.strokeStyle = `rgba(${red},${green},${blue}, 0.8)`;
					context.stroke ();
			}
			
			
			if(!stage.isGameDone){
				if(client.touches.length > 0){
					console.log("Touch to move detected");
					console.log("Touch[0]: " + client.touches[0]);
					console.log("Touch[0].x: " + touch.x + "  Touch[0].y: " + touch.y);
					var touch = client.touches[0];
					stage.player.headTo(new Pair (touch.x, touch.y));
				/*
				} else if (key=='p'){
					pausedGame = (!pausedGame);
					if (pausedGame != false){
						pauseGame();
					} else {
						startGame();
					}
				*/
				} else {
					if(!stage.isGameDone){
						stage.player.velocity=new Pair(0,0);
					}
				}
			}
		}
	}
}

function login(){

	//Group up requested username and password values for authentication
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};
		
	$.ajax({

		method: "POST",
		url: "/api/auth/login",
		data: JSON.stringify({}),
		headers: { "Authorization": "Basic", "username" : btoa(credentials.username), 
		"password" : btoa(credentials.password) },
		//headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData:false,
		contentType: "application/json; charset=utf-8",
		dataType:"json"

	}).done(function(data, text_status, jqXHR){
		
		console.log("what is happening")
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 
		setField('error', '', 'b', 0);
		$("#body").show();
		$("#ui_login").hide();
		$("#ui_play").show();
		$("#ui_nav").show();
		loggedIn = true;
		setupGame();
		startGame();
	
	}).fail(function(err){


		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
		console.log(err.responseJSON.error)
		document.getElementById("errorMessage").innerHTML = err.responseJSON.error;
		$("#errorMessage").show();

	}); 	

}

function register() {

	setField('error', '', 'b', 0);
	resetField('username');
	resetField('password');
	resetField('createUsername');
	resetField('createPassword');
	resetField('createFirstName');
	resetField('createLastName');


	resetField('createEmail');

	$("#ui_login").hide();
	$("#ui_register").show();
	$("#registerSubmit").hide();

}

function createAccount() {

	setField('error', '', 'b', 0);
	credentials =  { 
		"username": $("#createUsername").val(), 
		"password": $("#createPassword").val(),
		"email": $("#createEmail").val(),
		"firstname": $("#createFirstName").val(),
		"lastname": $("#createLastName").val() 
	};
		
	$.ajax({
		
		method: "POST",
		url: "/api/register",
		data: JSON.stringify({}),
		headers: { "Authorization": "Basic", "username" : btoa(credentials.username), 
		"password" : btoa(credentials.password), "email" : btoa(credentials.email),
		"firstName" : btoa(credentials.firstname), "lastName" : btoa(credentials.lastname) },
		//headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData:false,
		contentType: "application/json; charset=utf-8",
		dataType:"json"

	}).done(function(data, text_status, jqXHR){
		
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 
		setField('error', '', 'b', 0);
		resetField('password');
		$("#ui_login").show();
		$("#ui_play").hide();
		$("#ui_instructions").hide();
		$("#ui_stats").hide();
		$("#ui_profile").hide();
		$('#ui_register').hide();
		$("#registerSubmit").show();

	}).fail(function(err){

		setField('error', err.responseJSON.error, 'b', 0);
		$("#errorMessage").show();
		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

	}); 	
}
function play(){

	setField('error', '', 'b', 0);
	if (loggedIn) {
		$("#ui_login").hide();
		$("#ui_play").show();
		$("#ui_instructions").hide();
		$("#ui_stats").hide();
		$("#ui_profile").hide();
	}
	
}
function instructions(){

	setField('error', '', 'b', 0);
	if (loggedIn) {
		$("#ui_login").hide();
		$("#ui_play").hide();
		$("#ui_instructions").show();
		$("#goal").show();
		$("#controls").hide();
		$("#gunTypes").hide();
		$("#ui_stats").hide();
		$("#ui_profile").hide();
		pausedGame = true;
	}

}

function goal(){

	if (loggedIn) {
		$("#goal").show();
		$("#controls").hide();
		$("#gunTypes").hide();
		pausedGame = true;
	}

}

function controls(){

	if (loggedIn) {
		$("#goal").hide();
		$("#controls").show();
		$("#gunTypes").hide();
		pausedGame = true;
	}

}

function gunTypes(){

	if (loggedIn) {
		$("#goal").hide();
		$("#controls").hide();
		$("#gunTypes").show();
		pausedGame = true;
	}

}

function stats(){

	setField('error', '', 'b', 0);

	if (loggedIn) {
		$("#ui_login").hide();
		$("#ui_play").hide();
		$("#ui_instructions").hide();
		$("#ui_stats").show();
		$("#ui_profile").hide();
		pausedGame = true;
	}

}
function profile(){

	setField('error', '', 'b', 0);

	if (loggedIn) {

		credentials =  { 
			"username": $("#username").val(), 
		};
		
		$.ajax({
	
			method: "GET",
			url: "/api/auth/profile",
			data: JSON.stringify({}),
			headers: { "GET": "Profile information", "username" : btoa(credentials.username) },
			//headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"
	
		}).done(function(data, text_status, jqXHR){
			
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 
			setField('ui_profile', "Username: " + data.username, 'b', 0);
			setField('ui_profile', "Email: " + data.email, 'b', 2);
			setField('ui_profile', "First Name: " + data.firstname, 'b', 3);
			setField('ui_profile', "Last Name: " + data.lastname, 'b', 4);
			if (!data.score) {
				setField('ui_profile', "Score: 0", 'b', 5);
			}
			else {
				setField('ui_profile', "Score: " + data.score, 'b', 5);
			}			
			
			$("#ui_login").hide();
			$("#ui_play").hide();
			$("#ui_instructions").hide();
			$("#ui_stats").hide();
			$("#ui_profile").show();
			pausedGame = true;


		
		}).fail(function(err){

			setField('error', err.responseJSON.error, 'b', 0);
			$("#errorMessage").show();
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

			setField('error', '', 'b', 0);

	
		}); 	
	} 
}

function logout(){

	setField('error', '', 'b', 0);
	resetField('username');
	resetField('password');
	$("#ui_nav").hide();
	$("#ui_login").show();
	$("#ui_play").hide();
	$("#ui_instructions").hide();
	$("#ui_stats").hide();
	$("#ui_profile").hide();
	$('#errorMessage').show();
	$("#body").hide();
	loggedIn = false;

}

function updateScore(score) {

	if (loggedIn) {

		credentials =  { 
			"username": $("#username").val(), 
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
			if (!data.score) {
				setField('ui_profile', "Score: 0", 'b', 5);
			}
			else {
				setField('ui_profile', "Score: " + data.score, 'b', 5);
			}

			$("#ui_login").hide();
			$("#ui_play").show();
			$("#ui_instructions").hide();
			$("#ui_stats").hide();
			$("#ui_profile").hide();

		}).fail(function(err){

			setField('error', err.responseJSON.error, 'b', 0);
			$("#errorMessage").show();
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

		}); 	
	}
}

function changeUsername() {

	if (loggedIn) {

		credentials =  { 
			"oldusername": $("#username").val(), 
			"username": $("#changeUsername").val(), 
		};
			
		$.ajax({

			method: "PUT",
			url: "/api/auth/updateUsername",
			data: JSON.stringify({}),
			headers: { "PUT": "New username", "username" : btoa(credentials.username), 
			"oldUsername" : btoa(credentials.oldusername) },
			//headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"

		}).done(function(data, text_status, jqXHR){
			
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 
			setField('ui_profile', "Username: " + data.username, 'b', 0);
			resetField('changeUsername');
			var getUser = document.getElementById('username');
			getUser.value = data.username;

			$("#ui_login").hide();
			$("#ui_play").hide();
			$("#ui_instructions").hide();
			$("#ui_stats").hide();
			$("#ui_profile").show();
			pausedGame = true;

		}).fail(function(err){

			setField('error', err.responseJSON.error, 'b', 0);
			$("#errorMessage").show();
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

		}); 	
	}
}

function deleteUser() {

	if (loggedIn) {

		credentials =  { 
			"username": $("#username").val(), 
		};
			
		$.ajax({

			method: "DELETE",
			url: "/api/auth/delete",
			data: JSON.stringify({}),
			headers: { "DELETE": "delete user", "username" : btoa(credentials.username) },
			//headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"

		}).done(function(data, text_status, jqXHR){
			
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 
			setField('error', data.message, 'b', 0);
			resetField('username');
			$("#ui_login").show();
			$("#ui_play").hide();
			$("#ui_instructions").hide();
			$("#ui_stats").hide();
			$("#ui_profile").hide();
			$("#ui_nav").hide();
			pausedGame = true;

		}).fail(function(err){

			setField('error', err.responseJSON.error, 'b', 0);
			$("#errorMessage").show();
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

		}); 	
	}
}
function changeEmail() {

	if (loggedIn) {

		credentials =  { 
			"username": $("#username").val(), 
			"email": $("#changeEmail").val(), 
		};
			
		$.ajax({

			method: "PUT",
			url: "/api/auth/updateEmail",
			data: JSON.stringify({}),
			headers: { "PUT": "New email", "username" : btoa(credentials.username), 
			"email" : btoa(credentials.email) },
			processData:false,
			contentType: "application/json; charset=utf-8",
			dataType:"json"

		}).done(function(data, text_status, jqXHR){
			
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 
			resetField('changeEmail');
			setField('ui_profile', "Email: " + data.email, 'b', 2);
			$("#ui_login").hide();
			$("#ui_play").hide();
			$("#ui_instructions").hide();
			$("#ui_stats").hide();
			$("#ui_profile").show();
			pausedGame = true;

		}).fail(function(err){

			setField('error', err.responseJSON.error, 'b', 0);
			$("#errorMessage").show();
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

		}); 	
	}
}

function updateField(field, message, tag, index) {
	//var getDiv = document.getElementById(field);
	//var setTag = getDiv.getElementsByTagName(tag)[index];
	//setTag.innerHTML += message;
}
function setField(field, message, tag, index) {
	var getDiv = document.getElementById(field);
	//var setTag = getDiv.getElementsByTagName(tag)[index];
	//setTag.innerHTML = message;
}
function resetField(field){
	var toReset = document.getElementById(field);
	toReset.value = toReset.defaultValue; 
}

function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

$(function(){
	// Setup all events here and display the appropriate UI
	$("#loginSubmit").on('click',function(){ login(); });
	$("#registerSubmit").on('click',function(){ register(); });
	$("#createAccount").on('click',function(){ createAccount(); });
	$("#playButton").on('click',function(){ play(); });
	$("#instructionsButton").on('click',function(){ instructions(); });
	$("#statsButton").on('click',function(){ stats(); });
	$("#profileButton").on('click',function(){ profile(); });
	$("#logoutButton").on('click',function(){ logout(); });

	
	$("#goalSideButton").on('click',function(){ goal(); });
	$("#controlsSideButton").on('click',function(){ controls(); });
	$("#gunTypesSideButton").on('click',function(){ gunTypes(); });
	
	
	$("#changeUsernameButton").on('click',function(){ changeUsername(); });
	$("#changeEmailButton").on('click',function(){ changeEmail(); });
	$("#deleteUserButton").on('click',function(){ deleteUser(); });

	$('#error').show();
	$("#ui_nav").hide();
	$("#body").hide();
	$("#ui_login").show();
	$("#ui_register").hide();
	$("#ui_play").hide();
	$("#ui_instructions").hide();
	$("#ui_stats").hide();
	$("#ui_profile").hide();
	
	//Websocket stuff
	stage=new Stage(document.getElementById('stage'));
	context=stage.canvas.getContext("2d");
	
	socket = new WebSocket(`ws://${window.location.hostname}:8001`);
	socket.onopen = function (event) {
		console.log("connected");
		stage.canvas.addEventListener('touchend', function (event) { updateTouch("touchend", event); });
		stage.canvas.addEventListener('touchmove', function (event) { updateTouch("touchmove", event); });
		stage.canvas.addEventListener('touchstart', function (event) { updateTouch("touchstart", event) ;});
	};
	socket.onclose = function (event) {
		alert("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
	};
	socket.onmessage = function (event) {
		console.log(event.data);
		allClients=JSON.parse(event.data);
		update();
	}
		
		


		
});


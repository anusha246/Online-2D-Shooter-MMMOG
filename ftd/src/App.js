import './App.css';
import React, { Component } from 'react';
import * as ReactBootstrap from "react-bootstrap";
import axios from 'axios';
import Login from './components/Login';

const api = axios.create({
	baseURL: 'http://localhost:3000/'
})

class App extends Component {
	
	constructor(props) {
        super(props)
        this.state = {
            isLoggedIn: false,
            response: '',
            post: '',
            username: '',
            password: '',
            responseToPost: '',
        };
    }

	Register() {
	return(
		<div class="userForm" id="ui_register">
				<h2>Register</h2>
				<div id = "usernameField">
					<input type="text" id="createUsername" placeholder="Username" required/> 
				</div>
				<div id = "passwordField">
					<input type="password" id="createPassword" placeholder="Password" required/> 
				</div>
				<div id = "emailField">
					<input type="text" id="createEmail" placeholder="email@example.com" required/>
				</div>
				<div id = "firstNameField">
					<input type="text" id="createFirstName" placeholder="First Name" required/> 
				</div>
				<div id = "lastNameField">
					<input type="text" id="createLastName" placeholder="Last Name" required/> 
				</div>
				<div id = "requestRegister">
					<a type = "submit" id = "createAccount" value = "Registered"> Create Account </a>
				</div>
			</div>
	);
	}

	Instructions() {
	return(
		<div id="ui_instructions">
					<h2>Instructions</h2>
					<nav id = "sidebar">
						<ul>
							<li><a id="goalSideButton" type = "submit" value = "Goal">Goal</a></li>
							<li><a id="controlsSideButton" type = "submit" value = "Controls">Controls</a></li>
							<li><a id="gunTypesSideButton" type = "submit" value = "gunTypes">Gun Types</a></li>
						</ul>
					</nav>
					
					<div class="instructions_section" id="goal">
						<h3>Goal</h3>
						<p>Be the last one standing to win!
						<br>Gain points by shooting enemies</br>
						</p>
					</div>
					
					<div class="instructions_section" id="controls">
						<h3>Controls</h3>
						<p>Move with WASD
							<br>Press P to pause</br>
							<br>Aim the turret with the mouse</br>
							<br>Click the left mouse button to shoot</br>
						</p>
					</div>
					
					<div class="instructions_section" id="gunTypes">
						<h3>Gun Types</h3>
						<p>Move into numbered boxes to restore the ammo amount written on them, 
							<br>but you can destroy the ammo by shooting boxes</br>
							<br>Opaque boxes in the primary colors contain guns,</br>
							<br>these do not have numbers on them and cannot be destroyed</br>
						</p>
						
						<p id="pistolText">Blue Pistol: Fires 1 bullet at average speed and lifetime</p>
						<p id="sniperText">Yellow Sniper: Fires 1 bullet at high speed and lifetime</p>
						<p id="shotgunText">Red Shotgun: Fires 3 bullets at low speed and lifetime</p>
					</div>
				</div>
	);
	}

	Profile() {
	return(
		<div id="ui_profile">
				<h2>Profile</h2>
				<div>
					<b id = "profileUsername">Username: </b><br></br>
					<div id = "changeUsernameField">
						<input type="text" id="changeUsername" placeholder = "New Username"/>
						<input type="submit" id="changeUsernameButton" value="Change Username"/>
					</div>
					<b id = "profilePassword">Password: <span>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span> </b>
			<br></br>
					<b id = "profileEmail">Email: </b><br></br>
					<div id = "changeEmailField">
						<input type="text" id="changeEmail" placeholder = "New Email"/>
						<input type="submit" id="changeEmailButton" value="Change Email"/>
					</div>
					<b id = "profileFirstName">: </b><br></br>
					<b id = "profileLastName">Last Name: </b><br></br>
					<b id = "profileScore">Score: </b><br></br>
					<div id = "deleteUserField">
						<input type="submit" id="deleteUserButton" value="Delete User"/>
					</div>
				</div>
			</div>
	);
	}

	Error() {
	<div class = "errorForm" div id = "error">
				<b id="errorMessage" value="error"> </b>
		</div>
	}

	render() {
		return (
			<Login/>
			//this.Home()
		);
	}

}
export default App;

/* 
    <head>
      <meta charset="utf-8"/>
      <meta HTTP-EQUIV="EXPIRES" CONTENT="-1"></meta>
      <script src="jquery-3.5.1.min.js"></script>
      <script language="javascript" src="model.js" > </script>
      <script language="javascript" src="controller.js" > </script>
      <link rel="stylesheet" type="text/css" href="style.css" />
      <title>f0rt9it32d</title>
	  </head>
    */
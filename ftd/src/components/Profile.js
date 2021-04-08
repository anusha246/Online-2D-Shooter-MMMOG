import React, { Component } from 'react'

export class Profile extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            isLoggedIn: false,
            response: '',
            post: '',
            username: props.username,
            password: props.password,
            email: props.email,
            firstName: props.firstName,
            lastName: props.lastName,
            score: props.score,
            responseToPost: '',
        };
    }

    render() {
        return (
            <div>
                <body>
                <div id="ui_profile">
                    <h2>Profile</h2>
                    <div>
                        <b id = "profileUsername">Username: {this.state.username}</b><br/>
                        <div id = "changeUsernameField">
                            <input type="text" id="changeUsername" placeholder = "New Username"/>
                            <input type="submit" id="changeUsernameButton" value="Change Username"/>
                        </div>
                        <b id = "profilePassword">Password: <span>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span> </b><br/>
                        <b id = "profileEmail">Email: {this.state.email}</b><br/>
                        <div id = "changeEmailField">
                            <input type="text" id="changeEmail" placeholder = "New Email"/>
                            <input type="submit" id="changeEmailButton" value="Change Email"/>
                        </div>
                        <b id = "profileFirstName">First Name: {this.state.firstName}</b><br/>
                        <b id = "profileLastName">Last Name: {this.state.lastName}</b><br/>
                        <b id = "profileScore">Score: {this.state.score}</b><br/>
                        <div id = "deleteUserField">
                            <input type="submit" id="deleteUserButton" value="Delete User"/>
                        </div>
                    </div>
		        </div>
                </body>
            </div>
        )
    }
}

export default Profile

import React, { Component } from 'react'

export class Profile extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            response: '',
            post: '',
            newUsername: '',
            username: props.username,
            password: props.password,
            email: props.email,
            firstName: props.firstName,
            lastName: props.lastName,
            score: props.score,
            responseToPost: '',
        };
    }

    componentDidMount() {
		this.handleChangeUsername()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleChangeEmail()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    handleChangeUsername = async e => {
		e.preventDefault();
        const response = await fetch('/api/auth/updateUsername', {
            method: "PUT",
            data: JSON.stringify({}),
            headers: {
                "PUT": "Profile information", "username" : btoa(this.state.newUsername),
                "oldUsername" : btoa(this.state.username)
            },
            processData:false,
            contentType: "application/json; charset=utf-8",
            dataType:"json"
		});
        const body = await response.json();
        if (response.status === 200) {
            this.setState({ username: body.username });
            this.setState({ responseToPost: body.message });
            this.props.handler(body.username);
            console.log(body);
        }
		else if (response.status !== 200) {
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;

    }

    handleChangeEmail = async e => {
		e.preventDefault();

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
                            <input type="text" id="changeUsername" value = {this.state.newUsername}
                            onChange = {e => this.setState({newUsername: e.target.value})} placeholder = "New Username"/>
                            <input type="submit" id="changeUsernameButton" 
                            onClick = {this.handleChangeUsername}value="Change Username"/>
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
                        <p>{this.state.responseToPost}</p>
                    </div>
		        </div>
                </body>
            </div>
        )
    }
}

export default Profile

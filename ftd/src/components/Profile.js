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
            newEmail: '',
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
        this.handleDelete()
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
            this.props.nameHandler(body.username);
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
        const response = await fetch('/api/auth/updateEmail', {
            method: "PUT",
            data: JSON.stringify({}),
            headers: {
                "PUT": "New email", "username" : btoa(this.state.username), 
			    "email" : btoa(this.state.newEmail),
            },
            processData:false,
            contentType: "application/json; charset=utf-8",
            dataType:"json"
		});
        const body = await response.json();
        if (response.status === 200) {
            if (body.email === this.state.email) {
                this.setState({ responseToPost: 'Please enter a new email' });
            } else {
                this.setState({ email: body.email });
                this.setState({ responseToPost: body.message });
                this.props.emailHandler(body.email);
                console.log(body);
            }
        }
		else if (response.status !== 200) {
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;
    }

    handleDelete = async e => {
		e.preventDefault();
        const response = await fetch('/api/auth/delete', {
            method: "DELETE",
            data: JSON.stringify({}),
            headers: {
                "DELETE": "delete user", "username" : btoa(this.state.username) 
            },
            processData:false,
            contentType: "application/json; charset=utf-8",
            dataType:"json"
		});
        const body = await response.json();
        if (response.status === 200) {
            this.setState({ responseToPost: body.message }); 
            this.props.deleteHandler();
        }
		else if (response.status !== 200) {
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;
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
                            onClick = {this.handleChangeUsername} value="Change Username"/>
                        </div>
                        <b id = "profilePassword">Password: <span>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span> </b><br/>
                        <b id = "profileEmail">Email: {this.state.email}</b><br/>
                        <div id = "changeEmailField">
                            <input type="text" id="changeEmail" placeholder = "New Email" value = {this.state.newEmail}
                            onChange = {e => this.setState({newEmail: e.target.value})}/>
                            <input type="submit" id="changeEmailButton" 
                            onClick = {this.handleChangeEmail} value="Change Email"/>
                        </div>
                        <b id = "profileFirstName">First Name: {this.state.firstName}</b><br/>
                        <b id = "profileLastName">Last Name: {this.state.lastName}</b><br/>
                        <b id = "profileScore">Score: {this.state.score}</b><br/>
                        <div id = "deleteUserField">
                            <input type="submit" id="deleteUserButton" value="Delete User"
                            onClick = {this.handleDelete}/>
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

import React, { Component } from 'react'

export class Register extends Component {

    constructor(props) {
        super(props)
        this.state = {
            response: '',
            post: '',
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            responseToPost: '',
        };
    }

    componentDidMount() {
		this.handleRegister()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
	}

	handleRegister = async e => {
		e.preventDefault();
		const response = await fetch('/api/register', {
		  method: 'POST',
          data: JSON.stringify({}),
		  headers: {
			"username" : btoa(this.state.username), 
			"password" : btoa(this.state.password),
            "email" : btoa(this.state.email),
            "firstName" : btoa(this.state.firstName),
            "lastName" : btoa(this.state.lastName),
		  },
          processData:false,
          contentType: "application/json; charset=utf-8",
          dataType:"json"
		});
        const body = await response.json();
        if (response.status === 200) {
            this.setState({ responseToPost: body.message });
            this.props.registerHandler();
            console.log(body);
        }
		else if (response.status !== 200) {
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;
	};

    render() {
        return (
            <div>
                <body><h1>f0rt9it32d</h1>
                <div class="userForm" id="ui_register">
                    <h2>Register</h2>
                    <div id = "usernameField">
                        <input type="text" id="createUsername" placeholder="Username" value = {this.state.username}
                            onChange = {e => this.setState({ username: e.target.value }) }/> 
                    </div>
                    <div id = "passwordField">
                        <input type="password" id="createPassword" placeholder="Password" value = {this.state.password}
                            onChange = {e => this.setState({ password: e.target.value }) }/> 
                    </div>
                    <div id = "emailField">
                        <input type="text" id="createEmail" placeholder="email@example.com" value = {this.state.email}
                            onChange = {e => this.setState({ email: e.target.value }) }/> 
                    </div>
                    <div id = "firstNameField">
                        <input type="text" id="createFirstName" placeholder="First Name" value = {this.state.firstName}
                            onChange = {e => this.setState({ firstName: e.target.value }) }/> 
                    </div>
                    <div id = "lastNameField">
                        <input type="text" id="createLastName" placeholder="Last Name" value = {this.state.lastName}
                            onChange = {e => this.setState({ lastName: e.target.value }) }/> 
                    </div>
                    <div id = "requestRegister">
                        <a type = "submit" id = "createAccount" value = "Registered"
                        onClick = {this.handleRegister}> Create Account </a>
                    </div>
                    <p>{this.state.responseToPost}</p>
                </div>
                </body>
            </div>
        )
    }
}

export default Register

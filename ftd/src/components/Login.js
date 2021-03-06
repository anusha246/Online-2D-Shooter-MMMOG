import React, { Component } from 'react';
import Navigation from './Navigation.js';
import Register from './Register.js';
import { Button } from '@material-ui/core';


export class Login extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            isLoggedIn: false,
            viewRegister: false,
            viewLogin: true,
            response: '',
            post: '',
            username: '',
            password: '',
            responseToPost: '',
        };
        this.registerHandler = this.registerHandler.bind(this);

    }

	componentDidMount() {
		this.handleSubmit()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleRegister()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
	}

	handleSubmit = async e => {
		e.preventDefault();
		const response = await fetch('/api/auth/login', {
		  method: 'POST',
          data: JSON.stringify({}),
		  headers: {
			"username" : btoa(this.state.username), 
			"password" : btoa(this.state.password)
		  },
          processData:false,
          contentType: "application/json; charset=utf-8",
          dataType:"json"
		});
        const body = await response.json();
        if (response.status === 200) {
            this.setState({ responseToPost: body.message });
            this.setState({ isLoggedIn: true });
            this.setState({ viewRegister: false });
            this.setState({ viewLogin: false });

            console.log(body);
        }
		else if (response.status !== 200) {
            this.setState({ password: '' });
            this.setState({ username: '' });
            this.setState({ isLoggedIn: false });
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;
	};

    handleRegister = async e => {
        e.preventDefault();
        this.setState({ 
            viewRegister: true,
            viewLogin: false,
        });
    }

    registerHandler() {
        this.setState({ 
            viewRegister: false,
            viewLogin: true,
        });
    }

    render() {
        return (
        <div className="App">
            { this.state.isLoggedIn ? (
                    <body>
                        <Navigation username = {this.state.username} password = {this.state.password}
                        isLoggedIn = {this.state.isLoggedIn} viewNavbar = {true}/>
                    </body>
                ) : (
                    <body>  
                    </body>
                )
            }

            { this.state.viewRegister ? (
                    <body>
                        <Register registerHandler = {this.registerHandler}/>
                    </body>
                ) : (
                    <body>
                    </body>
                )
            }

            { this.state.viewLogin ? (
                    <body>
                        <h1>f0rt9it32d</h1>
                        <div class="userForm" id="ui_login">
                            <h2>Login</h2>
                            <div>
                            <p>{this.state.response}</p>
                            <form onSubmit={this.handleSubmit}>
                                <input type="text" id="username" placeholder="User Name" value = {this.state.username}
                                onChange = {e => this.setState({ username: e.target.value }) }/>
                                <input type="password" id="password" placeholder="Password" value = {this.state.password}
                                onChange = {e => this.setState({ password: e.target.value }) }/>
                                <Button variant="contained" color="primary"
                                onClick = {this.handleSubmit}>Login</Button>
                            </form>
                            <p>{this.state.responseToPost}</p>
                            </div>
                            <a type = "submit" id = "registerSubmit" value = "Register"
                            onClick = {this.handleRegister}> Register </a>
                        </div>
                    </body>
                ) : (
                    <body>
                    </body>
                )
            }
        </div> 
        );

    }
}

export default Login

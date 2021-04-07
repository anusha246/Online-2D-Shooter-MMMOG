import React, { Component } from 'react'
import Play from './Play';


export class Login extends Component {
    
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

	componentDidMount() {
		this.handleSubmit()
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

            this.setState({ password: '' });
            this.setState({ username: '' });
            this.setState({ isLoggedIn: true });
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

    render() {
        return (
        <div className="App">
        { 
            this.state.isLoggedIn ? (
                <Play/>
            ) : (
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
                        <button type="submit" id="loginSubmit" value="Login"
                        onClick = {this.handleSubmit}>Login</button>
                    </form>
                    <p>{this.state.responseToPost}</p>
                    </div>
                    <a type = "submit" id = "registerSubmit" value = "Register"> Register </a>
                </div>
                </body>
            )
        }
        </div> 
        );

    }
}

export default Login

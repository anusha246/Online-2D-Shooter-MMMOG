import './App.css';
import React, { Component } from 'react';
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

	render() {
		return (
			<Login/>
			//this.Home()
		);
	}

}
export default App;
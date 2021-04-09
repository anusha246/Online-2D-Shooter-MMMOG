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
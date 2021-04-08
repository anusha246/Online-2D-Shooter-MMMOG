import React, { Component } from 'react';
import Navigation from './Navigation.js';


class Play extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoggedIn: false,
            response: '',
            post: '',
            username: props.username,
            password: props.password,
            responseToPost: '',
        };
    }

    render() {
        return (
            <body>
                <h1>f0rt9it32d</h1>
                <div>
                    <Navigation username = {this.state.username} password = {this.state.password}/>
                    <div id="ui_play">
                        <center>
                            <canvas id="stage" width="600" height="600" styles="border:1px solid black;"> </canvas>
                        </center>
                    </div>
                </div>
            </body>
        )
    }
}

export default Play

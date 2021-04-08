import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
//import * as ReactBootstrap from "react-bootstrap";


class Navigation extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoggedIn: false,
            response: '',
            post: '',
            username: props.username,
            password: props.password,
            email: '',
            firstName: '',
            lastName: '',
            score: 0,
            responseToPost: '',
            viewProfile: false,
            viewInstructions: false,
            viewStatistics: false,

            
        };
    }

	componentDidMount() {
		this.handleProfileClick()
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
	}
    
	handleProfileClick = async e => {
		e.preventDefault();
		const response = await fetch('/api/auth/profile', {
            method: "GET",
            data: JSON.stringify({}),
            headers: {
                "GET": "Profile information", "username" : btoa(this.state.username)
            },
            processData:false,
            contentType: "application/json; charset=utf-8",
            dataType:"json"
		});
        const body = await response.json();
        if (response.status === 200) {
            this.setState({ viewProfile: true });
            this.setState({ email: body.email });
            this.setState({ username: body.username });
            this.setState({ firstName: body.firstname });
            this.setState({ lastName: body.lastname });
            this.setState({ score: body.score });

            console.log(body);
        }
		else if (response.status !== 200) {
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;
	};

    handleStatisticsClick = async e => {
		e.preventDefault();
        this.setState({ viewProfile: false });
    }

    handlePlayClick = async e => {
		e.preventDefault();
        this.setState({ viewProfile: false });
    }

    handleInstructionsClick = async e => {
		e.preventDefault();
        this.setState({ viewProfile: false });
    }

    handleLogoutClick = async e => {
		e.preventDefault();
        this.setState({ viewProfile: false });
    }


    render() {
        return (
            <div>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#play" onClick = {this.handlePlayClick}>Play</Nav.Link>
                        <Nav.Link href="#stats" onClick = {this.handleStatisticsClick} >Statistics</Nav.Link>
                        <Nav.Link href="#profile" onClick = {this.handleProfileClick}>Profile</Nav.Link>
                        <Nav.Link href="#instructions" onClick = {this.handleInstructionsClick}>Instructions</Nav.Link>

                        <NavDropdown title="Instructions" id="collasible-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Statistics</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Logout</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <Nav.Link href="#Logout" onClick = {this.handleLogoutClick}>Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                </Navbar>
                <div>
                    { 
                    this.state.viewProfile ? (
                        <div id="ui_profile">
                        <h2>Profile</h2>
                        <div>
                            <b id = "profileUsername">Username: { this.state.username } </b><br/>
                            <div id = "changeUsernameField">
                                <input type="text" id="changeUsername" placeholder = "New Username"/>
                                <input type="submit" id="changeUsernameButton" value="Change Username"/>
                            </div>
                            <b id = "profilePassword">Password: <span>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span> </b><br/>
                            <b id = "profileEmail">Email: { this.state.email } </b><br/>
                            <div id = "changeEmailField">
                                <input type="text" id="changeEmail" placeholder = "New Email"/>
                                <input type="submit" id="changeEmailButton" value="Change Email"/>
                            </div>
                            <b id = "profileFirstName">First Name: { this.state.firstName } </b><br/>
                            <b id = "profileLastName">Last Name: { this.state.lastName }</b><br/>
                            <b id = "profileScore">Score: { this.state.score }</b><br/>
                            <div id = "deleteUserField">
                                <input type="submit" id="deleteUserButton" value="Delete User"/>
                            </div>
                        </div>
                    </div>
                    ) : (
                        <body></body>
                    ) }
                </div>
            </div>
        );
    }
}

export default Navigation

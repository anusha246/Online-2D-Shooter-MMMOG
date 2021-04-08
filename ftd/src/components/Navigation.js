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
            this.setState({ responseToPost: body.message });
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
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#play">Play</Nav.Link>
                        <Nav.Link href="#stats">Statistics</Nav.Link>
                        <Nav.Link href="#profile" onClick = {this.handleProfileClick}>Profile</Nav.Link>
                        <Nav.Link href="#instructions">Instructions</Nav.Link>

                        <NavDropdown title="Instructions" id="collasible-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Statistics</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Logout</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <Nav.Link href="#Logout">Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                </Navbar>
                <div>
                    { 
                    this.state.viewProfile ? (
                        <div id="ui_profile">
                        <h2>Profile</h2>
                        <div>
                            <b id = "profileUsername">Username: </b><br/>
                            <div id = "changeUsernameField">
                                <input type="text" id="changeUsername" placeholder = "New Username"/>
                                <input type="submit" id="changeUsernameButton" value="Change Username"/>
                            </div>
                            <b id = "profilePassword">Password: <span>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span> </b><br/>
                            <b id = "profileEmail">Email: </b><br/>
                            <div id = "changeEmailField">
                                <input type="text" id="changeEmail" placeholder = "New Email"/>
                                <input type="submit" id="changeEmailButton" value="Change Email"/>
                            </div>
                            <b id = "profileFirstName">: </b><br/>
                            <b id = "profileLastName">Last Name: </b><br/>
                            <b id = "profileScore">Score: </b><br/>
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

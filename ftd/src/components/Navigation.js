import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Profile from './Profile.js';
import Instructions from './Instructions.js';
import Login from './Login.js';


//import * as ReactBootstrap from "react-bootstrap";


class Navigation extends Component {

    constructor(props) {
        super(props)
        this.state = {
            response: '',
            post: '',
            username: props.username,
            password: props.password,
            email: '',
            firstName: '',
            lastName: '',
            score: 0,
            responseToPost: '',
            viewNavbar: props.viewNavbar,
            viewLogin: !props.isLoggedIn,
            viewProfile: false,
            viewInstructions: false,
            viewLeaderboard: false,
            viewPlay: false,
        };

        this.nameHandler = this.nameHandler.bind(this);
        this.emailHandler = this.emailHandler.bind(this);
        this.deleteHandler = this.deleteHandler.bind(this);



    }

	componentDidMount() {
		this.handleProfileClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleInstructionsClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handlePlayClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleLeaderboardClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleLogoutClick()
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
            this.setState({ 
                email: body.email,
                username: body.username, 
                firstName: body.firstname, 
                lastName: body.lastname, 
                score: body.score, 
                viewLogin: false,
                viewProfile: true,
                viewLeaderboard: false,
                viewInstructions: false 
            });
            console.log(body);
        }
		else if (response.status !== 200) {
            this.setState({ responseToPost: body.error });
            console.log(body);
			//throw Error(response);
		}
        return body;
	};

    handleLeaderboardClick = async e => {
		e.preventDefault();
        this.setState({ 
            viewLogin: false,
            viewProfile: false,
            viewLeaderboard: true,
            viewInstructions: false,
        });

    }

    handlePlayClick = async e => {
		e.preventDefault();
        this.setState({ 
            viewLogin: false,
            viewProfile: false,
            viewLeaderboard: false,
            viewInstructions: false,
            viewPlay: true,
        });
    }

    handleInstructionsClick = async e => {
		e.preventDefault();
        this.setState({ 
            viewLogin: false,
            viewProfile: false,
            viewLeaderboard: false,
            viewInstructions: true,
        });
    }

    handleLogoutClick = async e => {
		e.preventDefault();
        this.setState({ 
            viewLogin: true,
            viewProfile: false,
            viewLeaderboard: false,
            viewInstructions: false,
            viewNavbar: false,
        });
    }

    nameHandler(name) {
        this.setState({
          username: name
        });
    }

    emailHandler(email) {
        this.setState({
          email: email
        });
      }

    deleteHandler() {
        this.setState({ 
            viewLogin: true, 
            username : '', 
            email: '', 
            password: '',
            viewProfile: false,
            viewLeaderboard: false,
            viewInstructions: false,
            viewNavbar: false,
        });
    }


    render() {
        return (
            <div>
                { this.state.viewNavbar ? (
                    <div>
                        <h1>f0rt9it32d</h1>

                        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                                <Nav.Link href="#play" onClick = {this.handlePlayClick}>Play</Nav.Link>
                                <Nav.Link href="#stats" onClick = {this.handleLeaderboardClick} >Leaderboard</Nav.Link>
                                <Nav.Link href="#profile" onClick = {this.handleProfileClick}>Profile</Nav.Link>
                                <Nav.Link href="#instructions" onClick = {this.handleInstructionsClick}>Instructions</Nav.Link>

                                <NavDropdown title="Instructions" id="collasible-nav-dropdown">
                                    <NavDropdown.Item href="#action/3.1">Leaderboard</NavDropdown.Item>
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
                    </div> ) : (<body></body>) 
                }
                { this.state.viewLogin ? (<Login/>) : (<body></body>) }
                
                { this.state.viewProfile ? 
                (<Profile username = {this.state.username} password = {this.state.password}
                email = {this.state.email} score = {this.state.score} firstName = {this.state.firstName}
                lastName = {this.state.lastName} nameHandler = {this.nameHandler}
                emailHandler = {this.emailHandler} deleteHandler = {this.deleteHandler}/>) : (<body></body>) }

                { this.state.viewInstructions ? (<Instructions/>) : (<body></body>) }
            </div>
        );
    }
}

export default Navigation

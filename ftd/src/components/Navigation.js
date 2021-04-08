import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Profile from './Profile.js';
import Instructions from './Instructions.js';

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
            viewLogin: !props.isLoggedIn,
            viewProfile: false,
            viewInstructions: false,
            viewLeaderboard: false,
        };

        this.stateHandler = this.stateHandler.bind(this);

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
            this.setState({ email: body.email });
            this.setState({ username: body.username });
            this.setState({ firstName: body.firstname });
            this.setState({ lastName: body.lastname });
            this.setState({ score: body.score });
            this.setState({ viewLogin: false });
            this.setState({ viewProfile: true });
            this.setState({ viewLeaderboard: false });
            this.setState({ viewInstructions: false });
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
        this.setState({ viewLogin: false });
        this.setState({ viewProfile: false });
        this.setState({ viewLeaderboard: true });
        this.setState({ viewInstructions: false });
    }

    handlePlayClick = async e => {
		e.preventDefault();
        this.setState({ viewLogin: false });
        this.setState({ viewProfile: false });
        this.setState({ viewLeaderboard: false });
        this.setState({ viewInstructions: false });
    }

    handleInstructionsClick = async e => {
		e.preventDefault();
        this.setState({ viewLogin: false });
        this.setState({ viewProfile: false });
        this.setState({ viewLeaderboard: false });
        this.setState({ viewInstructions: true });
    }

    handleLogoutClick = async e => {
		e.preventDefault();
        this.setState({ viewLogin: true });
        this.setState({ viewProfile: false });
        this.setState({ viewLeaderboard: false });
        this.setState({ viewInstructions: false });

    }

    stateHandler(name) {
        this.setState({
          username: name
        })
      }


    render() {
        return (
            <div>
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
                <div>
                    { this.state.viewProfile ? 
                    (<Profile username = {this.state.username} password = {this.state.password}
                    email = {this.state.email} score = {this.state.score} firstName = {this.state.firstName}
                    lastName = {this.state.lastName} handler = {this.stateHandler}/>) : (<body></body>) }

                    { this.state.viewInstructions ? (<Instructions/>) : (<body></body>) }
                </div>
            </div>
        );
    }
}

export default Navigation

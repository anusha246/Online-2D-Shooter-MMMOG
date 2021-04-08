import React, { Component } from 'react'

export class Profile extends Component {
    
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
            <div>
                
            </div>
        )
    }
}

export default Profile

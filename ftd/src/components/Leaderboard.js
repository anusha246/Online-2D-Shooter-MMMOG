import React, { Component } from 'react'

export class Leaderboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            response: '',
            post: '',
            username: props.username,
            email: '',
            responseToPost: props.responseToPost,
            rows: props.rows,
            rowCount: props.rowCount,
        };
    }



    render() {
        return (
            <div>
                {this.state.rows}
                {this.responseToPost}
            </div>
        )
    }
}

export default Leaderboard

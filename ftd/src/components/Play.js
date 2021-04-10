import React, { Component } from 'react';

class Play extends Component {

    constructor(props) {
        super(props)
        this.canvasRef = this.refs.canvas;
        this.state = {
            isLoggedIn: props.isLoggedIn,
            response: '',
            post: '',
            username: props.username,
            password: props.password,
            responseToPost: '',
        };
        this.canvasHandler = this.canvasHandler.bind(this);

    };

    componentDidMount() {
        this.clearCanvas();
    }
    
    clearCanvas(){
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d"); //// 3 - access node using .current
        ctx.fillStyle = "white";
        //ctx.clearRect(0,0, 600, 600);
        ctx.fillRect(0, 0, canvas.width, canvas.height);                    ////   - do something!
        ctx.strokeStyle="#000000";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);//for white background

    }

    canvasHandler() {
        return this.canvasRef.current;
    }
    

    render() {
        return (
            <body>
                <div>
                        <center>
                            <canvas ref="canvas" width="600" height="600" 
                            styles="border:1px solid black;" > canvas </canvas>
                            {document.getElementById('canvas')}
                        </center>
                </div>
            </body>
        )
    }
}

export default Play




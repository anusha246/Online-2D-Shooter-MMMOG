import React, { Component } from 'react'

export class Instructions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            viewGoals: true,
            viewControls: false,
            viewGuns: false,
        };
    }

    componentDidMount() {
		this.handleGoalClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleControlClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        this.handleGunClick()
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    handleGoalClick = async e => {
		e.preventDefault();
        this.setState({ viewGoals: true });
        this.setState({ viewControls: false });
        this.setState({ viewGuns: false });
    }

    handleControlClick = async e => {
		e.preventDefault();
        this.setState({ viewGoals: false });
        this.setState({ viewControls: true });
        this.setState({ viewGuns: false });
    }

    handleGunClick = async e => {
		e.preventDefault();
        this.setState({ viewGoals: false });
        this.setState({ viewControls: false });
        this.setState({ viewGuns: true });
    }

    render() {
        return (
            <div>
                <div id="ui_instructions">
                    <h2>Instructions</h2>
                    <nav id = "sidebar">
                        <ul>
                            <li><a id="goalSideButton" type = "submit" value = "Goal"
                            onClick = {this.handleGoalClick}>Goal</a></li>
                            <li><a id="controlsSideButton" type = "submit" value = "Controls"
                            onClick = {this.handleControlClick}>Controls</a></li>
                            <li><a id="gunTypesSideButton" type = "submit" value = "gunTypes"
                            onClick = {this.handleGunClick}>Gun Types</a></li>  
                        </ul>
                    </nav>

                    { this.state.viewGoals ? (
                        <div class="instructions_section" id="goal">
                            <h3>Goal</h3>
                            <p>Be the last one standing to win!
                                <br/>Gain points by shooting enemies
                            </p>
                        </div>
                    ) : (<body></body>) }

                    { this.state.viewControls ? (
                    <div class="instructions_section" id="controls">
                        <h3>Controls</h3>
                        <p>Move with WASD
                            <br/>Press P to pause
                            <br/><br/>Aim the turret with the mouse
                            <br/>Click the left mouse button to shoot
                        </p>
                    </div>) : (<body></body>) }

                    { this.state.viewGuns ? (
                     <div class="instructions_section" id="gunTypes">
                        <h3>Gun Types</h3>
                        <p>Move into numbered boxes to restore the ammo amount written on them, 
                            <br/>but you can destroy the ammo by shooting boxes
                            <br/><br/>Opaque boxes in the primary colors contain guns,
                            <br/>these do not have numbers on them and cannot be destroyed
                        </p>
                        <p id="pistolText">Blue Pistol: Fires 1 bullet at average speed and lifetime</p>
                        <p id="sniperText">Yellow Sniper: Fires 1 bullet at high speed and lifetime</p>
                        <p id="shotgunText">Red Shotgun: Fires 3 bullets at low speed and lifetime</p>
                    </div>) : (<body></body>) }


                </div>
            </div>
        )
    }
}

export default Instructions

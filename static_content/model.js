function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas){
		this.canvas = canvas;
	
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
		this.isGameDone = false;
	
		// the logical width and height of the stage
		this.width=800;
		this.height=800;
		
		//Get the width and height of the html canvas viewport
		this.view_width=canvas.width;
		this.view_height=canvas.height;
		this.camX = this.width/2;
		this.camY = this.height/2;
		

		//Starter values for both player and opponents
		var velocity = new Pair(0,0);
		var radius = 18;
		var aim_pos = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		var turret_pos = new Pair(Math.floor(this.width/2), Math.floor(this.height/2) - radius);
		var health = 10;
		var ammo = 10;
		var gunType = "Pistol";
		
		
		//Create opponents
		var num_opponents = 3;
		for (var i=0; i<num_opponents; i++){
			
			var colour= 'rgba(255,0,0,1)';
			var opponent_pos = new Pair(Math.floor((Math.random()*this.width)), 
										Math.floor((Math.random()*this.height)));
										
			//Random integers in range code below from
			//https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
			//Set move_time a random int between 1 and 200
			var move_time = Math.floor(Math.random() * (200 - 1 + 1)) + 1;
			
			this.addActor(new Opponent(this, opponent_pos, velocity, colour, 
										radius, aim_pos, turret_pos, health, ammo, 
										move_time, gunType));
		}
		
		//Create player
		var score = 0;
		this.midPosition = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		var colour= 'rgba(0,0,0,1)';
		
		this.score = score;
		this.addPlayer(new Player(this, this.midPosition, velocity, colour, radius, 
									aim_pos, turret_pos, health, ammo, score, gunType));
		
		
		
	
		// Generate Boxes
		this.numBoxes=20;
		this.generateBoxes(this.numBoxes);
		
	}

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  
	//Do this by asking each of the actors to take a single step. 
	step(){
		//Loop through actors list
		for(var i=0;i<this.actors.length;i++){
			
			//If actor can take a step, do it 
			if (typeof this.actors[i].step == 'function'){
				
				var shouldStep = true;
				
				//Loop through actors list to check for collisions
				for(var j=0;j<this.actors.length;j++){
					
					//If the player is dead or all opponents are dead
					//or object is colliding with something else
					if (!this.actors[i].shouldStep(this.actors[j])){
							
						shouldStep = false;
						
						//If a bullet hits a player or opponent it was not shot from
						if (this.actors[i].constructor.name == "Bullet" &&
							this.actors[j].constructor.name != "Box" &&
							this.actors[i].shotFrom != this.actors[j].constructor.name){
							
							//If bullet was shot from player, update player score
							if (this.player && this.actors[i].shotFrom == "Player") {
								this.player.score++;
								updateScore(this.player.score);
							}
						}
						break;
					}
				}
				
				//If actor is not colliding with anything, step
				if(shouldStep){
					this.actors[i].step();
					
					//If actor is the player, adjust its aim position
					//based on its velocity
					if (this.actors[i] == this.player){
						this.actors[i].aim_pos.x += this.actors[i].velocity.x;
						this.actors[i].aim_pos.y += this.actors[i].velocity.y;
					}
					
				} 
					
						
				
			}
			
			//If Bullet, decrease lifetime by 1
			if ((this.actors[i].constructor.name) == "Bullet"){
				this.actors[i].lifetime -= 1;
				
				
				//If Bullet's lifetime reaches 0, delete it
				if (this.actors[i].lifetime <= 0){
					this.removeActor(this.actors[i]);
				}
			}
			
			//If actor exists and has health, remove it if health is 0
			if (this.actors[i] && typeof this.actors[i].health == 'number'){
				if (this.actors[i].health <= 0){
					
					//Save score and position in case of player death
					this.score = this.player.score;
					this.midPosition = this.player.position;
					
					//Remove player or opponent whose health is 0
					if (this.actors[i] == this.player){
						this.removePlayer(this.actors[i]);
					} else {
						this.removeActor(this.actors[i]);
					}
				}
			}
			
			//If there are no more boxes on canvas, generate more
			if (!this.actors.some(Object => Object.constructor.name == "Box")){
						
				this.generateBoxes(this.numBoxes);
			} 
			
			//If there is no player or no opponents on canvas, game is done
			if (this.player == null || 
				!this.actors.some(Object => Object.constructor.name == "Opponent")){
						
				this.isGameDone = true;
				break;
			} 
			
			
		}
		
	}

	draw(){
		var context = this.canvas.getContext('2d');
		
		if (this.isGameDone){
			
			//Set background and font for game done screen on viewport
			context.fillStyle = 'rgba(0,0,0,0.5)';
			context.fillRect(-this.view_width, -this.view_height, 
					this.width+this.view_width + this.view_width, this.height+this.view_height + this.view_height);
			
			context.font = "30px Courier New";
			context.fillStyle = "white";
			context.textAlign = "center";
			
			//If player is dead, show Game Over (game loss) and score
			if (this.player == null){
				context.fillText("Game Over", this.midPosition.x, this.midPosition.y);
				context.fillText("Your score is " + this.score, 
									this.midPosition.x, this.midPosition.y + 30);
									
			//All opponents are dead, show Game Won and score
			} else {
				var bonus = 5;
				this.score += bonus;
				
				context.fillText("You Won!", this.midPosition.x, this.midPosition.y);
				context.fillText("The win bonus is " + bonus, 
									this.midPosition.x, this.midPosition.y + 30);
				context.fillText("Your score is " + this.score, 
									this.midPosition.x, this.midPosition.y + 60);
			}
				
		//Game is not done
		} else {
			
			//Reset the transform matrix, clear canvas
			context.setTransform(1,0,0,1,0,0);
			context.clearRect(0, 0, this.width, this.height);
			
			//Set viewport position centered on player and translate to it
			this.camX = -this.player.x + this.view_width / 2;
			this.camY = -this.player.y + this.view_height / 2;
			
			context.translate( this.camX, this.camY ); 
			
			//Color canvas white with black border
			context.fillStyle = "white";
			context.fillRect(0, 0, this.width, this.height);
			context.strokeStyle = 'black';
			context.fillStyle = 'rgba(0,0,0,1)';
			context.strokeRect(0, 0, this.width, this.height);
			
			//Loop through all actors
			for(var i=0;i<this.actors.length;i++){

				//If actor exists, draw it
				if (this.actors[i]){
					this.actors[i].draw(context);
				}
			
			}
		}
		
		
		
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
	
	//Generate numBoxes Boxes randomly placed and sized on canvas
	generateBoxes(numBoxes){
		while(numBoxes>0){
			
			//Get random x and y position based on canvas size
			var x=Math.floor((Math.random()*(this.width-200))); 
			var y=Math.floor((Math.random()*(this.height-200))); 
			
			//If an actor does not exist at (x, y) position
			if(this.getActor(x,y)===null){
				
				var red=randint(255), green=randint(255), blue=randint(255);
				
				//Random integers in range code below from
				//https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
				//Set width and height values between 5 and 200 inclusive
				var width = Math.floor(Math.random() * (200 - 5 + 1)) + 5;
				var height = Math.floor(Math.random() * (200 - 5 + 1)) + 5;
				
				var colour= 'rgba('+red+','+green+','+blue+','+0.75+')';
				var position = new Pair(x,y);
				var health = 3;
				var type = "Ammo";
				
				//Randomly make a Box a gun box based on gunSpawn value
				var gunSpawn = Math.floor(Math.random()*10);
				if (gunSpawn == 0){
					type = "Pistol";
					health = 100;
				} else if (gunSpawn == 1){
					type = "Sniper";
					health = 100;
				} else if (gunSpawn == 2){
					type = "Shotgun";
					health = 100;
				}
					
				//Add Box to actors
				var b = new Box(this, position, colour, width, height, health, type);
				this.addActor(b);
				numBoxes--;
			}
		}
	}
		
	
	

} // End Class Stage

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
	
	//Scale a Pair by num's value
	multiply(num){
		this.x = this.x * num;
		this.y = this.y * num;
	}
}

class Box {
	constructor(stage, position, colour, width, height, health, type){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.colour = colour;
		this.width = width;
		this.height = height;
		this.health = health;
		this.type = type;
		
		if (this.type == "Pistol"){
			this.colour = "blue";
		} else if (this.type == "Sniper"){
			this.colour = "yellow";
		} else if (this.type == "Shotgun"){
			this.colour = "red";
		}
	}
	
	toString(){
		return this.position.toString();
	}
	
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.width, this.height);  
		
		//Only show health on box if ammo box
		if (this.type == "Ammo"){
			context.font = "15px Courier New";
			context.fillStyle = "black";
			context.textAlign = "center";
			context.fillText(this.health, this.x+this.width/2, this.y+this.height/2+4);
		}
	}
}


class Ball {
	constructor(stage, position, velocity, colour, radius){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
	}
	
	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}
	
	//Returns true if this is not going into object, false otherwise
	shouldStep(object){
		if (object.constructor.name == "Box"){
			
			//If going inside Box
			if (this.position.x + this.velocity.x > object.position.x && 
				this.position.x + this.velocity.x < object.position.x + object.width &&
				this.position.y + this.velocity.y > object.position.y &&
				this.position.y + this.velocity.y < object.position.y + object.height){
				
				//If this is a Bullet, decrease object (Box) health
				//and expire Bullet
				if (this.constructor.name == "Bullet"){
					object.health--;
					this.lifetime = 0;
				
				//Actor is a Player or Opponent, pickup ammo capped at 10
				} else {
					
					//Ammo pickup based on box health, 10 max
					this.ammo += object.health;
					if (this.ammo > 10){
						this.ammo = 10;
					}
					
					//If Box is Sniper or Pistol box
					if (object.type != "Ammo"){
						this.gunType = object.type;
					}
					
					object.health = 0;
				}
					
				
				return false;
			} 
			
			return true;
		
		
		//Else it is object extended from Ball: Bullet, Player, or Opponent
		} else {
						
			if (this != object){
				//If going inside object extended from Ball
				if (this.position.x + this.velocity.x > object.position.x - object.radius && 
					this.position.x + this.velocity.x < object.position.x + object.radius &&
					this.position.y + this.velocity.y > object.position.y - object.radius &&
					this.position.y + this.velocity.y < object.position.y + object.radius){
					
					
					if (this.constructor.name == "Bullet"){
						
						//If Bullet colliding into other Bullet
						if (object.constructor.name == "Bullet"){
							
							if (this.shotFrom != object.shotFrom){
								object.lifetime = 0;
								
							//Friendly bullet, keep moving
							} else {
								return true;
							}
							
						//If bullet was not shot from object, decrease 
						//object health and expire Bullet
						} else if (object.constructor.name != this.shotFrom){
							object.health--;
							this.lifetime = 0;
						} else {
							return true;
						}
						
					
					}
						
					
					return false;
				} 
				
				return true;
			}
		}
		
		return true;
	}

	step(){
		
		//Update position based on velocity
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;
			
			
		// bounce off the canvas walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
		
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		
		
		context.fillStyle = this.colour;
		
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   
	}
}

class Player extends Ball {
	
	constructor(stage, position, velocity, colour, radius, aim_pos, 
				turret_pos, health, ammo, score, gunType){
		
		super(stage, position, velocity, colour, radius);
		
		this.aim_pos = aim_pos;
		this.turret_pos = turret_pos;
		this.health = health;
		this.ammo = ammo;
		this.score = score;
		this.gunType = gunType;
	}
	
	draw(context){
		
		//Draw turret
		this.turret_pos.x=(this.aim_pos.x - this.x);
		this.turret_pos.y=(this.aim_pos.y - this.y);
		this.turret_pos.normalize();
		
		this.turret_pos.x = this.turret_pos.x * this.radius + this.x;
		this.turret_pos.y = this.turret_pos.y * this.radius + this.y;
		
		//Set turret colour based on gunType
		if (this.gunType == "Pistol"){
			context.fillStyle = "blue";
			context.strokeStyle = "blue"; 
		} else if (this.gunType == "Sniper"){
			context.fillStyle = "yellow";
			context.strokeStyle = "yellow";
			
		//Shotgun
		} else {
			context.fillStyle = "red";
			context.strokeStyle = "red";
		}
		
		context.beginPath(); 
		context.arc(this.turret_pos.x, this.turret_pos.y, this.radius - 8, 0, 2 * Math.PI, false); 
		context.stroke();
		context.fill();
		
		//Set stroke, fill colors
		context.fillStyle = this.colour;
		context.strokeStyle = this.colour;
		
		//Draw main body
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();
		
		//Show player ammo
		context.font = "15px Courier New";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(this.ammo, this.turret_pos.x, this.turret_pos.y +4);   
		
		//Show player health 
		context.font = "20px Courier New";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.health, this.x, this.y+6);
		
		//Show player score
		context.font = "17px Courier New";
		context.fillStyle = "black";
		context.textAlign = "left";
		context.fillText("Score: " + this.score, this.x - stage.view_width/2 + 10, 
							this.y - stage.view_height/2 + 20);
		
	}
		
	
}

class Opponent extends Ball {
	
	constructor(stage, position, velocity, colour, radius, aim_pos, 
				turret_pos, health, ammo, move_time, gunType){
				
		super(stage, position, velocity, colour, radius);
		
		this.aim_pos = aim_pos;
		this.turret_pos = turret_pos;
		this.health = health;
		this.ammo = ammo;
		
		this.move_time = move_time;
		this.gunType = gunType;
	}
	
	attack(){
		
		this.aim_pos = this.stage.player.position;
		this.move_time--;
		
		//If move_time expired, set new random one, new random velocity
		if (this.move_time <= 0){
			
			//Set a new move_time between 100 and 200
			this.move_time = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
			
			var new_x_vel = Math.floor(Math.random() * (2 - (-2) + 1)) + (-2);
			var new_y_vel = Math.floor(Math.random() * (2 - (-2) + 1)) + (-2);
			
			this.velocity = new Pair(new_x_vel, new_y_vel);
		}
		
		
		//Randomly shoot bullet from turret towards player
		if (Math.floor(Math.random()*200) == 0){
			
			//If opponent has ammo, shoot a bullet from turret, decrease ammo count
			if (this.ammo > 0){
				
				var bullet_pos_x = this.turret_pos.x;
				var bullet_pos_y = this.turret_pos.y + 1;
				
				this.stage.addActor(new Bullet(this.stage, new Pair(bullet_pos_x, bullet_pos_y), 
											this.stage.player.position, new Pair(0, 0), 
											'rgba(255,0,0,1)', 3,
											"Opponent", this.gunType));
											
				
				this.ammo--;
				
			}
		}
		
		
		
		
	}
	
	draw(context){
		
		//Draw turret

		this.turret_pos.x=(this.aim_pos.x - this.x);
		this.turret_pos.y=(this.aim_pos.y - this.y);
		this.turret_pos.normalize();
		
		this.turret_pos.x = this.turret_pos.x * this.radius + this.x;
		this.turret_pos.y = this.turret_pos.y * this.radius + this.y;
		
		this.attack();
		
		//Set turret colour based on gunType
		if (this.gunType == "Pistol"){
			context.fillStyle = "blue";
			context.strokeStyle = "blue"; 
		} else if (this.gunType == "Sniper"){
			context.fillStyle = "yellow";
			context.strokeStyle = "yellow";
			
		//Shotgun
		} else {
			context.fillStyle = "red";
			context.strokeStyle = "red";
		}
			
		context.beginPath(); 
		context.arc(this.turret_pos.x, this.turret_pos.y, this.radius - 8, 0, 2 * Math.PI, false); 
		context.stroke();
		context.fill();
		
		//Set stroke, fill colors
		context.fillStyle = this.colour;
		context.strokeStyle = this.colour;
		
		//Draw main body
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke(); 
		
		//Show ammo
		context.font = "15px Courier New";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(this.ammo, this.turret_pos.x, this.turret_pos.y+4);
		
		//Show health 
		context.font = "20px Courier New";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.health, this.x, this.y+6);
		
		
		
	}
	
}

class Bullet extends Ball {
	constructor(stage, position, aim_pos, velocity, colour, radius, 
				shotFrom, type){
		super(stage, position, velocity, colour, radius);
		
		this.lifetime = 100;
		this.shotFrom = shotFrom;
		this.type = type;
		this.aim_pos = aim_pos;
		this.headTo(this.aim_pos);
		this.velocity.multiply(2);
		
		//Set lifetimes and velocities based on gun type
		if (type == "Sniper"){
			this.lifetime = this.lifetime*2;
			this.velocity.multiply(4);
			
		} else if (type == "Shotgun"){
			
			//Create two more bullets
			
			//Getting arc coordinates code from
			//https://stackoverflow.com/questions/12342102/html5-get-coordinates-of-arcs-end
			//Use arc coordinates to set bullet position offset, aim_pos offset
			this.stage.addActor(new Bullet(this.stage, 
									new Pair(this.position.x+Math.cos(45*Math.PI/180)*3,
											this.position.y+Math.sin(45*Math.PI/180)*3), 
									new Pair(this.aim_pos.x+Math.cos(45*Math.PI/180)*100,
											this.aim_pos.y+Math.sin(45*Math.PI/180)*100),
									new Pair(0, 0), this.colour, this.radius, this.shotFrom, 
									"Shotgun extra"));
			
			this.stage.addActor(new Bullet(this.stage, 
									new Pair(this.position.x-Math.cos(45*Math.PI/180)*3,
											this.position.y-Math.sin(45*Math.PI/180)*3),
									new Pair(this.aim_pos.x-Math.cos(45*Math.PI/180)*100,
											this.aim_pos.y-Math.sin(45*Math.PI/180)*100),
									new Pair(0, 0), this.colour, this.radius, this.shotFrom, 
									"Shotgun extra"));
			
		
		} else if (type == "Pistol"){
			this.velocity.multiply(2);
		}
	}
	
	draw(context){
		
		//Set stroke, fill colors
		context.fillStyle = this.colour;
		context.strokeStyle = "black";
		
		//Draw bullet
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();
		context.fill(); 
	}
	
}


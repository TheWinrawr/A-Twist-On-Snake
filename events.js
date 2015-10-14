var gameCanvas = $("#gameboard")[0];
var gameCtx = gameCanvas.getContext("2d");
var width = gameCanvas.width;
var height = gameCanvas.height;

var stackSize = 0; //size of canvas stack, this is reduced to zero every time the game restarts

var Events = {
	
	_eventProgram: false, //true when the snake eats a certain amount of food, this determines whether to run the event methods at all or not
	_eventActive: false, //true if an event is currently active
	_timeUntilEvent: 0,

	activate: function() {
		console.log("activated");
		if(this._eventActive) return; //don't active another event if one is already active

		//picks a random event to initiate
		var numTransforms = Math.floor(Math.random() * this.transforms.length);
		Events.transforms[numTransforms].makeActive();
		this._eventActive = true;
	},

	update: function() {
		if(!this._eventProgram) return; //don't do anything if this class shouldn't run

		console.log(this._timeUntilEvent + " " + this._eventActive);	

		//Activate an event if there's no event currently active and the timer ran out
		if(!this._eventActive && this._timeUntilEvent <= 0) {
			this.activate();
			console.log("Event activated");
		}

		//If an event is active, animate it. Otherwise, decrease the timer.
		if(this._eventActive) {

			var hasEventRunning = false; //this stays false if the current event is done running

			//animate all active events (there should only be one)
			for(var i in Events.transforms) {
				var animType = Events.transforms[i];
				if(animType.isActive()) {
					animType.animate();
					hasEventRunning = true;
				}
			}

			if(!hasEventRunning) this._eventActive = false;
		}
		
		else {
			this._timeUntilEvent--;
		}
	},

	hasActiveEvent: function() {
		return this._eventActive;
	},

	setTimeUntilEvent: function(time) {
		this._timeUntilEvent = time;
	},

	reset: function() {
		//Cancel the current event animation
		for(var i in Events.transforms) {
			Events.transforms[i].reset();
		}

		this._eventActive = false;

		//Deplete the stack and restore the canvas to its default state
		while(stackSize-- > 0) {
			gameCtx.restore();
		}

		gameCtx.resetTransform();
		saveCanvas();

		this._eventProgram = false;

	},

	startEventProgram: function() {
		this._eventProgram = true;
	},

	eventProgramStarted: function() {
		return this._eventProgram;
	}

}

Events.transforms = [
	{
		_name: "rotate",
		_dir: ["clockwise", "counterclockwise"],
		_currDir: "clockwise",
		_active: false,
		_maxAngle: 180,
		_angle: 0,
		_currTotalAngle: 0,
		_rotateSpeed: 0,
		_rotateAccel: 0.05,
		_rotateAccelInit: 0.05,

		animate: function() {
			//don't animate anything if the event is not active
			if(!this._active) return;
			
			this._angle += this._rotateSpeed;
			this._rotateSpeed += this._rotateAccel;

			if(this._currTotalAngle + this._angle > this._maxAngle) {
				this._angle = this._maxAngle - this._currTotalAngle;
				this._active = false;
			}

			this._currTotalAngle += this._angle;

			//rotate the canvas around its center
			gameCtx.translate(width/2, height/2);

			if(this._currDir === "clockwise")
				gameCtx.rotate(degToRad(this._angle));
			else if(this._currDir === "counterclockwise")
				gameCtx.rotate(-degToRad(this._angle));

			gameCtx.translate(-width/2, -height/2);

			//reached max angle
			if(!this._active) {
				this.reset(); //deactive the event and reset all vars
				console.log("exceeded");
			}
		},

		reset: function() {
			saveCanvas();

			console.log(Events._eventActive);
			console.log("reset");

			this._active = false;
			this._angle = 0;
			this._currTotalAngle = 0;
			this._rotateSpeed = 0;
			this._rotateAccel = this._rotateAccelInit;
		},

		isActive: function() {
			return this._active;
		},

		makeActive: function() {
			this._active = true;
			this._currDir = this._dir[Math.floor(Math.random() * this._dir.length)]
		},

		hasName: function(name) {
			return this._name === name;
		}

	},

	{
		_name: "flip",
		_dir: ["horizontal", "vertical"],
		_currDir: "horizontal",
		_active: false,
		_maxFlip: 180,
		_flipAmount: 0,
		_flipSpeed: 8,
		_currFlip: 0,

		animate: function() {
			//don't animate anything if the event is not active
			if(!this._active) return;

			//Restore the previous canvas, with previous rotations/flips applied to it, save it to the stack, then scale it
			restoreCanvas();
			saveCanvas();

			//console.log((this._currFlip + flipAmount) + " " + this._maxFlip);
			if(this._flipAmount + this._flipSpeed >= this._maxFlip) {
				this._flipAmount = this._maxFlip;
				this._active = false;
				console.log("deactivated");
			}

			//clear and flip the canvas
			//gameCtx.clearRect(0, 0, width, height);

			if(this._currDir === "horizontal") {
				gameCtx.translate(width/2, 0);
				gameCtx.scale(Math.cos(degToRad(this._flipAmount)), 1);
				gameCtx.translate(-width/2, 0);
			}

			else if(this._currDir === "vertical") {
				gameCtx.translate(0, height/2);
				gameCtx.scale(1, Math.cos(degToRad(this._flipAmount)));
				gameCtx.translate(0, -height/2);
			}

			if(!this._active)
				this.reset();

			this._flipAmount += this._flipSpeed;
		},

		reset: function() {
			saveCanvas();
			console.log("reset");

			this._active = false;

			this._currFlip = 0;
			this._flipAmount = 0;
		},

		isActive: function() {
			return this._active;
		},

		makeActive: function() {
			this._active = true;
			this._currDir = this._dir[Math.floor(Math.random() * this._dir.length)];
		},

		hasName: function(name) {
			return this._name === name;
		}

	}
]

function degToRad(degree) {
	return (Math.PI / 180) * degree;
}

function saveCanvas() {
	stackSize++;
	gameCtx.save();
}

function restoreCanvas() {
	stackSize--;
	gameCtx.restore();
}
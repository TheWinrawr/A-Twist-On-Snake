$(document).ready(function() {
	var canvas;
	var context;
	var cWidth;
	var cHeight;

	var gridSize;
	var gridOrigin;

	var snake; //array of snake tiles
	var food;
	var dir; //direction of the snake
	var cellSize;
	var interval = 0;
	var requestId;
	var gameOver;

	var growthPerFood = 3;
	var numHeadsToAdd = 0;

	var rotAngle = 0;

	var numFoodEaten = 0;

	var warningImg;
	var warningImgOpacity;
	var timeUntilWarning;
	var showWarning;
	var numWarningsToShow;

	init();

	function degToRad(degrees) {
		return (Math.PI/180)*degrees;
	}

	function init() {
		canvas = $("#gameboard")[0];
		context = canvas.getContext("2d");
		cWidth = canvas.width;
		cHeight = canvas.height;

		warningImg = new Image();
		warningImg.src = "img/warning.png";

		//set up the cage which the snake is in
		cellSize = 8;
		gridSize = Math.floor( (cWidth / Math.sqrt(2)) / cellSize) * cellSize;
		gridOrigin = (cWidth - gridSize) / 2;

		//set up other stuff
		

		restart();
	}

	function restart() {
		numFoodEaten = 0;

		Events.reset();
		
		context.clearRect(0, 0, cWidth, cHeight);

		makeSnake();
		console.log("Game initiated");
		dir = "right";
		makeFood();
		gameOver = false;

		warningImgOpacity = 1;
		timeUntilWarning = 0;
		showWarning = false;
		numWarningsToShow = 3;

		tick();
	}

	function makeSnake() {
		var initLength = 5; //set initial length of snake to 5
		snake = [];
		for(var i = 0; i < initLength; i++) {
			snake.push({x:initLength-i, y:0});
		}

	}

	function makeFood() {
		food = {
			x: Math.round(Math.random() * (gridSize-cellSize) / cellSize), 
			y: Math.round(Math.random() * (gridSize-cellSize) / cellSize)
		};
	}

	function tick() {
		requestId =  requestAnimationFrame(tick);
		if(interval++ >= 2) {
			context.rotate(degToRad(rotAngle));
			update();
			updateEvents();
			draw();
			interval = 0;
		}
		if(gameOver) {
			cancelAnimationFrame(requestId);
			restart();
		}
	}

	function update() {
		var headX;
		var headY;
		headX = snake[0].x;
		headY = snake[0].y;

		//move the snake
		if(dir === "right") headX++;
		else if(dir === "left") headX--;
		else if(dir === "up") headY--;
		else if(dir === "down") headY++;

		//check if snake hit a wall
		if(checkCollision(headX, headY)) {
			console.log("restarted");
			gameOver = true;
		}

		//check if snake ate food
		if(food.x === headX && food.y === headY) { //snake at food
			numHeadsToAdd += growthPerFood;
			makeFood();
			numFoodEaten++;
		}

		if(numHeadsToAdd > 0) {
			snake.unshift({x: headX, y:headY});
			numHeadsToAdd--;
		}
		else {
			var tail = snake.pop(); //pop the tail, move it to the front if the snake didn't eat anything
			tail.x = headX;
			tail.y = headY;
			snake.unshift(tail);
		}
		
	}

	function updateEvents() {
		var foodReq = 3;
		if(numFoodEaten < foodReq) return;

		if(timeUntilWarning === 0) {
			timeUntilWarning = 50 + Math.random() * 100;
		}

		if(timeUntilWarning <= 0 && numWarningsToShow > 0) {
			showWarning = true;
		}

		if(timeUntilWarning <= 0 && !showWarning && !Events.eventProgramStarted()) {
			Events.startEventProgram();
			Events.setTimeUntilEvent(0);
		}

		if(Events.hasActiveEvent()) {
			console.log("Time set");
			Events.setTimeUntilEvent(Math.random() * 200);
		}
		Events.update();

		if(timeUntilWarning > 0) timeUntilWarning--;
	}

	function draw() {
		context.fillStyle = "white";
		context.clearRect(0, 0, $("canvas").width(), $("canvas").height());
		context.strokeStyle = "black";
		context.strokeRect(gridOrigin, gridOrigin, gridSize, gridSize);

		//paint the snake
		for(var i = 0; i < snake.length; i++)
			drawCell(snake[i].x, snake[i].y, "green");
		//paint the food
		drawCell(food.x, food.y, "red");

		if(showWarning)
			drawWarning();
	}

	function drawCell(x, y, color) {
		context.fillStyle = color;
		context.fillRect(x*cellSize+gridOrigin, y*cellSize+gridOrigin, cellSize, cellSize);
	}

	function drawWarning() {
		context.globalAlpha = warningImgOpacity;
		var imgWidth = 400;
		var imgHeight = 100;
		context.drawImage(warningImg, (cWidth-imgWidth)/2, cHeight/2 - imgHeight/2, imgWidth, imgHeight);
		context.globalAlpha = 1;

		warningImgOpacity -= 0.05;
		if(warningImgOpacity < 0) {
			warningImgOpacity = 1;
			numWarningsToShow--;
		}

		if(numWarningsToShow <= 0) showWarning = false;
	}

	function checkCollision(x, y) {
		//check if snake hit itself
		for(var i = 0; i < snake.length; i++) {
			if(snake[i].x === x && snake[i].y === y) 
				return true;
		}
		//check if snake hit a wall
		if(x < 0 || x >= gridSize/cellSize || y < 0 || y >= gridSize/cellSize)
			return true;

		return false;
	}

	$(document).keydown(function(e) {
		var key = e.which;
		if(key == "37" || key == "38" || key == "39" || key == "40")
			e.preventDefault();
		
		if(key == "37" && dir != "right") dir = "left";
		else if(key == "38" && dir != "down") dir = "up";
		else if(key == "39" && dir != "left") dir = "right";
		else if(key == "40" && dir != "up") dir = "down";
	})

})
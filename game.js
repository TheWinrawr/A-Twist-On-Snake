$(document).ready(function() {
	/*Define canvas variables*/
	var gameCanvas;
	var gameCtx;
	var cWidth;
	var cHeight;

	/*Define a m x m grid - the snake cannot go out of these boundaries*/
	var gridSize;
	var gridOrigin;  //upper left corner of the grid
	var cellSize;  //size of each cell 

	/*Define in-game variables*/
	var snake; //array of snake tiles
	var food; //food coordinates
	var dir; //direction of the snake

	var interval; //this controls game speed
	var requestId;
	var gameOver;

	var growthPerFood = 3;
	var numHeadsToAdd;

	var numFoodEaten;

	/*Define variables for the warning sign*/
	var warningImg;
	var warningImgOpacity;
	var timeUntilWarning;  //after the snake eats a certain number of food items, this variable starts counting down
	var warningIsActive;
	var numWarningsToShow; //how many times the warning should show

	init();

	function degToRad(degrees) {
		return (Math.PI/180)*degrees;
	}

	function init() {
		/*Create canvas and context*/
		gameCanvas = $("#gameboard")[0];
		gameCtx = gameCanvas.getContext("2d");
		cWidth = gameCanvas.width;
		cHeight = gameCanvas.height;

		/*Create the warning image once so we don't have to reload it every time*/
		warningImg = new Image();
		warningImg.src = "img/warning.png";

		//set up the grid and cell variables
		cellSize = 8;
		gridSize = Math.floor( (cWidth / Math.sqrt(2)) / cellSize) * cellSize;
		gridOrigin = (cWidth - gridSize) / 2;

		scoreboardInit(gridSize, gridOrigin);

		restart();
	}

	function restart() {
		/*Reset events*/
		Events.reset();

		/*Clear the canvas*/
		gameCtx.clearRect(0, 0, cWidth, cHeight);

		/*Instantiate game variables*/
		gameOver = false;
		interval = 0;

		/*Instantiate snake variables*/
		growthPerFood = 3;
		numFoodEaten = 0;
		numHeadsToAdd = 0;

		/*Instantiate warning sign variables*/
		warningImgOpacity = 1;
		timeUntilWarning = 0;
		warningIsActive = false;
		numWarningsToShow = 3;

		/*Create the snake and food*/
		makeSnake();
		dir = "right";
		makeFood();

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
		if(food.x === headX && food.y === headY) { //snake ate food
			numHeadsToAdd += growthPerFood;
			makeFood();
			numFoodEaten++;
		}

		if(numHeadsToAdd > 0) { //snake ate food and it's stil growing
			snake.unshift({x: headX, y:headY});
			numHeadsToAdd--;
		}
		else { //snake did not eat food
			var tail = snake.pop(); //pop the tail, move it to the front if the snake didn't eat anything
			tail.x = headX;
			tail.y = headY;
			snake.unshift(tail);
		}
		
	}

	function updateEvents() {
		var foodReq = 0;
		if(numFoodEaten < foodReq) return;

		if(timeUntilWarning === 0) {
			timeUntilWarning = 50 + Math.random() * 100;
		}

		if(timeUntilWarning <= 0 && numWarningsToShow > 0) {
			warningIsActive = true;
		}

		if(timeUntilWarning <= 0 && !warningIsActive && !Events.eventProgramStarted()) {
			Events.startEventProgram();
			Events.setTimeUntilEvent(0);
		}

		if(Events.hasActiveEvent()) {
			//console.log("Time set");
			Events.setTimeUntilEvent(Math.random() * 200);
			gameCtx.fillStyle = "rgba(204, 204, 204, 1)";
		gameCtx.fillRect(gridOrigin, gridOrigin, gridSize, gridSize);
		}
		Events.update();

		if(timeUntilWarning > 0) timeUntilWarning--;
	}

	function draw() {
		gameCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
		gameCtx.fillRect(0, 0, cWidth, gridOrigin);
		gameCtx.fillRect(0, 0, gridOrigin, cHeight);
		gameCtx.fillRect(0, gridOrigin+gridSize, cWidth, gridOrigin);
		gameCtx.fillRect(gridOrigin+gridSize, 0, gridOrigin, cHeight);

		//gameCtx.strokeStyle = "black";
		//gameCtx.strokeRect(gridOrigin, gridOrigin, gridSize, gridSize);

		gameCtx.fillStyle = "rgba(204, 204, 204, 0.5)";
		gameCtx.fillRect(gridOrigin, gridOrigin, gridSize, gridSize);

		//paint the snake
		for(var i = 0; i < snake.length; i++)
			drawCell(snake[i].x, snake[i].y, "green");
		//paint the food
		drawCell(food.x, food.y, "red");

		if(warningIsActive)
			drawWarning();

		gameCtx.globaCompositeOperation = "lighter";

		drawScoreboard();
	}

	function drawCell(x, y, color) {
		gameCtx.fillStyle = color;
		gameCtx.fillRect(x*cellSize+gridOrigin, y*cellSize+gridOrigin, cellSize, cellSize);
	}

	function drawWarning() {
		gameCtx.globalAlpha = warningImgOpacity;
		var imgWidth = 400;
		var imgHeight = 100;
		gameCtx.drawImage(warningImg, (cWidth-imgWidth)/2, cHeight/2 - imgHeight/2, imgWidth, imgHeight);
		gameCtx.globalAlpha = 1;

		warningImgOpacity -= 0.05;
		if(warningImgOpacity < 0) {
			warningImgOpacity = 1;
			numWarningsToShow--;
		}

		if(numWarningsToShow <= 0) warningIsActive = false;
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
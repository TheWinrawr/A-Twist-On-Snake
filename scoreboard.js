var scoreCanvas;
var scoreCtx;
var scWidth;
var scHeight;
var gridSize;
var scOrigin;

/*Initiliaze the scoreboard canvas*/
function scoreboardInit(gameGridSize, gameGridOrigin) {
	gridSize = gameGridSize;
	scoreCanvas = $("#scoreboard")[0];
	scoreCtx = scoreCanvas.getContext("2d");
	scWidth = scoreCanvas.width;
	scHeight = gridSize;
	scOrigin = gameGridOrigin;

	drawScoreboard();
}

function drawScoreboard() {
	/*
	console.log($("#gameboard").css("left"));
	var leftOffset = (parseInt($("#gameboard").css("margin-left"))) + scOrigin + gridSize;
	console.log(leftOffset);
	$("#scoreboard").css("left", leftOffset);
	$("#scoreboard").css("top", scOrigin + 7);

	scoreCtx.fillStyle = "rgb(128, 128, 128)";
	scoreCtx.fillRect(0, 0, scWidth, scHeight);
	*/
}

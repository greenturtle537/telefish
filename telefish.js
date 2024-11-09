// Consts
const title = "Telefish";
const author = "greenturtle537";
const REVISION = "$Revision: 0.1 $".split(' ')[1];
const tear_line = "\r\n--- " + js.exec_file + " " + REVISION + "\r\n";
const ini_section = "telefish"; // ini file section


var options = load({}, "modopts.js", ini_section);

const test = js.exec_dir + "test.bin";

require("sbbsdefs.js", "K_NONE");
require("mouse_getkey.js", "mouse_getkey");

function show_image(filename, fx, delay)
{
	var dir = directory(filename);
	filename = dir[random(dir.length)];
	var Graphic = load({}, "graphic.js");
	var sauce_lib = load({}, "sauce_lib.js");
	var sauce = sauce_lib.read(filename);
	if (delay === undefined)
		delay = options.image_delay;
	if (sauce && sauce.datatype == sauce_lib.defs.datatype.bin) {
		try {
			var graphic = new Graphic(sauce.cols, sauce.rows);
			graphic.load(filename);
			if (fx && graphic.revision >= 1.82)
				graphic.drawfx('center', 'center');
			else
				graphic.draw('center', 'center');
			sleep(delay);
		} catch (e) {
			log(LOG_DEBUG, e);
		}
	}
}

function getCharAtPos(x, y) {
	// Move the cursor to position (x, y)
	console.gotoxy(x, y);

	// Calculate the index in the screen buffer
	var index = (y - 1) * console.screen_columns + (x - 1);

	// Get the character at that position
	var charAtPosition = console.screen_buf[index];
	return charAtPosition;
}

function loadMapToGrid(filename, grid) {
	var file = new File(filename);
	if (!file.open("r")) {
		alert("Failed to open " + filename);
		return;
	}

	var y = 0;
	while (!file.eof && y < grid.length) {
		var line = file.readln();
		for (var x = 0; x < line.length && x < grid[y].length; x++) {
			grid[y][x] = line.charAt(x);
		}
		y++;
	}

	file.close();
	return grid;
}


function gameLoop() {
	var gridWidth = 80;
	var gridHeight = 24;
	var grid = [];
	var playerX = Math.floor(gridWidth / 2);
	var playerY = Math.floor(gridHeight / 2);

	// Initialize grid with empty values
	for (var y = 0; y < gridHeight; y++) {
		grid[y] = [];
		for (var x = 0; x < gridWidth; x++) {
			grid[y][x] = '.';
		}
	}

	// Fill grid from text file
	var staticGrid = loadMapToGrid(js.exec_dir + "simplemap.txt", grid);
	if (staticGrid) {
		grid = staticGrid;
	}

	console.clear();
	console.autowrap = false;

	var running = true;
	var prevX = playerX;
	var prevY = playerY;

	while (running) {
		// Draw initial grid
		console.gotoxy(1, 1);
		for (var y = 0; y < gridHeight; y++) {
			for (var x = 0; x < gridWidth; x++) {
				console.print(grid[y][x]);
			}
			console.crlf();
		}

		// Draw player
		console.gotoxy(playerX + 1, playerY + 1);
		console.print('@');

		// Get input
		var mk = mouse_getkey(K_NONE, 100, true);
		var key = mk.key;

		if (mk) {
			if (typeof mk === 'object' && mk.mouse) {
				// Handle mouse input
				if (mk.mouse.action === 1) { // Left click
					var mx = mk.mouse.column - 1;
					var my = mk.mouse.row - 1;
					if (mx >= 0 && mx < gridWidth && my >= 0 && my < gridHeight) {
						prevX = playerX;
						prevY = playerY;
						playerX = mx;
						playerY = my;
					}
				}
			} else {
				switch (key) {
					case KEY_UP:
					case 'w':
						if (playerY > 0) {
							prevY = playerY;
							playerY--;
						}
						sleep(150); // 100ms pause after move
						break;
					case KEY_DOWN:
					case 's':
						if (playerY < gridHeight - 1) {
							prevY = playerY;
							playerY++;
						}
						sleep(150); // 100ms pause after move
						break;
					case KEY_LEFT: 
					case 'a':
						if (playerX > 1) {
							prevX = playerX;
							playerX -= 2;
						}
						sleep(100); // 100ms pause after move
						break;
					case KEY_RIGHT:
					case 'j':
						bbs.multinode_chat();
					case '\x1b': // Escape key
						running = false;
						break;
				}
				console.clearkeybuffer(); // Used to prevent key buffering!!
			}
		}

		// Redraw the tile that the player has just left
		if (prevX !== playerX || prevY !== playerY) {
			console.gotoxy(prevX + 1, prevY + 1);
			console.print(grid[prevY][prevX]);

			// Draw player at new position
			console.gotoxy(playerX + 1, playerY + 1);
			console.print('@');

			// Return the console cursor to the player's position
			console.gotoxy(playerX - 1, playerY - 1);
		}
	}
	console.clear();
}

try {
	console.print("Press any key to play the demo. It's 'Trouta be fire' ");
	console.pause();
	gameLoop();
	exit(0);
} catch (e) {
	var msg = file_getname(e.fileName) +
		" line " + e.lineNumber +
		": " + e.message;
	if (js.global.console) {
		console.crlf();
	}
	alert(msg);
	if (user.alias != author) {
		var msgbase = new MsgBase('mail');
		var hdr = {
			to: author,
			from: user.alias || system.operator,
			subject: title
		};
		msg += tear_line;
		if (!msgbase.save_msg(hdr, msg)) {
			alert("Error saving exception-message to: " + options.sub);
		}
		msgbase.close();
	}
}

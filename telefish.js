// Consts
const title = "Telefish";
const author = "greenturtle537";
const REVISION = "$Revision: 0.1 $".split(' ')[1];
const tear_line = "\r\n--- " + js.exec_file + " " + REVISION + "\r\n";

var options = load({}, "modopts.js", ini_section);

const test = js.exec_dir + "test.bin";

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

function gameLoop() {
	var gridSize = 16;
	var grid = [];
	var playerX = Math.floor(gridSize / 2);
	var playerY = Math.floor(gridSize / 2);

	// Initialize grid
	for (var y = 0; y < gridSize; y++) {
		grid[y] = [];
		for (var x = 0; x < gridSize; x++) {
			grid[y][x] = '@';
		}
	}

	console.clear();
	console.autowrap = false;

	var running = true;
	while (running) {
		// Draw grid
		console.gotoxy(1, 1);
		for (var y = 0; y < gridSize; y++) {
			for (var x = 0; x < gridSize; x++) {
				if (x === playerX && y === playerY) {
					console.print('#');
				} else {
					console.print(grid[y][x]);
				}
			}
			console.crlf();
		}

		// Get input
		var key = mouse_getkey(K_NOECHO | K_NOSPIN);
		if (key) {
			if (typeof key === 'object' && key.mouse) {
				// Handle mouse input
				if (key.mouse.action === 1) { // Left click
					var mx = key.mouse.column - 1;
					var my = key.mouse.row - 1;
					if (mx >= 0 && mx < gridSize && my >= 0 && my < gridSize) {
						playerX = mx;
						playerY = my;
					}
				}
			} else {
				switch (key) {
					case KEY_UP:
						if (playerY > 0) playerY--;
						break;
					case KEY_DOWN:
						if (playerY < gridSize - 1) playerY++;
						break;
					case KEY_LEFT:
						if (playerX > 0) playerX--;
						break;
					case KEY_RIGHT:
						if (playerX < gridSize - 1) playerX++;
						break;
					case '\x1b': // Escape key
						running = false;
						break;
				}
			}
		}
	}
	console.clear();
}

try {
	console.print("The game is still being built. Please wait. It's 'Trouta be fire' ");
	gameLoop();
	console.pause();
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

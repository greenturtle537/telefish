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

function gameLoop() {
	var gridWidth = 48;
	var gridHeight = 24;
	var grid = [];
	var playerX = Math.floor(gridWidth / 2);
	var playerY = Math.floor(gridHeight / 2);

	// Initialize grid
	for (var y = 0; y < gridHeight; y++) {
		grid[y] = [];
		for (var x = 0; x < gridWidth; x++) {
			grid[y][x] = '.';
		}
	}

	console.clear();
	console.autowrap = false;

	var running = true;
	while (running) {
		// Draw grid
		console.gotoxy(1, 1);
		for (var y = 0; y < gridHeight; y++) {
			for (var x = 0; x < gridWidth; x++) {
				if (x === playerX && y === playerY) {
					console.print('@');
				} else {
					console.print(grid[y][x]);
				}
			}
			console.crlf();
		}

		// Get input
		var mk = mouse_getkey(K_NONE, 1000, true);
		var key = mk.key;

		if (mk) {
			if (typeof mk === 'object' && mk.mouse) {
				// Handle mouse input
				if (mk.mouse.action === 1) { // Left click
					var mx = key.mouse.column - 1;
					var my = key.mouse.row - 1;
					if (mx >= 0 && mx < gridWidth && my >= 0 && my < gridHeight) {
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
						if (playerY < gridHeight - 1) playerY++;
						break;
					case KEY_LEFT:
						if (playerX > 0) playerX--;
						break;
					case KEY_RIGHT:
						if (playerX < gridWidth - 1) playerX++;
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

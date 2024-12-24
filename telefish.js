// Consts
const title = "Telefish";
const author = "greenturtle537";
const REVISION = "$Revision: 0.1 $".split(' ')[1];
const tear_line = "\r\n--- " + js.exec_file + " " + REVISION + "\r\n";
const ini_section = "telefish"; // ini file section
const telefish_title = js.exec_dir + "telefish.ans";
const telefish_title_xbin = js.exec_dir + "telefish.xbin";

var debug = false; //Debug flag

var options = load({}, "modopts.js", ini_section);

// Telefish options

var screenWidth = 80;
var screenHeight = 24;

// Telefish global variables
var Window = load({}, "Window.js");
var MessageWindow = load({}, "MessageWindow.js");
var NodeTalk = load({}, "NodeTalk.js");


load("utils.js");

var chatWindow = new MessageWindow(30, 24, 1, 1);
chatWindow.setTitle("====Telefish  Node  Chat====");
var fishWindow = new Window(40, 10, 35, 10);
fishWindow.setTitle("=Currently waiting for a fish to bite=");
var nodeTalk = new NodeTalk();

var Graphic = load({}, "graphic.js");
var sauce_lib = load({}, "sauce_lib.js");

require("sbbsdefs.js", "K_NONE");
require("mouse_getkey.js", "mouse_getkey");

function show_image(filename, fx, delay) {
	var dir = directory(filename);
	filename = dir[random(dir.length)];

	if (delay === undefined) {
	    delay = 0;
    }

	var graphic = new Graphic();
	graphic.load(filename);
	if (fx && graphic.revision >= 1.82)
		graphic.drawfx('center', 'center');
	else
		graphic.draw('center', 'center');
	sleep(delay);
}

function loadGraphicsFromANSI(filename) {
	const graphic = new Graphic();
	if (!graphic.load(filename)) {
		throw new Error(`Failed to load ANSI file: ${filename}`);
	}

	const tiles = {};
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let codeIndex = 0;

	for (let y = 0; y < graphic.height; y += 2) {
		for (let x = 0; x < graphic.width; x += 4) {
			const tile = graphic.get(x, y, x + 3, y + 1);
			const bin = tile.BIN;
			const base64Code = base64Chars[Math.floor(codeIndex / 64)] + base64Chars[codeIndex % 64];
			tiles[base64Code] = bin;
			codeIndex++;
			if (codeIndex >= 64 * 64) {
				throw new Error('Exceeded base64 code limits.');
			}
		}
	}

	return tiles;
}

function drawGraphicAt(x, y, base64Code, graphicsDict) {
	const bin = graphicsDict[base64Code];
	if (!bin) {
		throw new Error(`Graphic with code ${base64Code} not found.`);
	}

	const graphic = new Graphic();
	graphic.BIN = bin;
	graphic.draw(x, y);
}

function logo() {
	console.clear();
	show_image(telefish_title, false, 0);
	console.pause();
	console.clear();
}

function redrawPlayer(playerX, playerY) {
	if (windowConflict(playerX, playerY)) {
		offScreenCursor();
	} else {
		console.gotoxy(playerX + 1, playerY + 1);
		console.print('@');
		console.gotoxy(playerX + 1, playerY + 1);
	}
}

function windowConflict(prevX, prevY) {
	if (chatWindow.toggled) {
		if ((
			prevX + 1 >= chatWindow.x &&
			prevX + 1 < chatWindow.x + chatWindow.width &&
			prevY + 1 >= chatWindow.y &&
			prevY + 1 < chatWindow.y + chatWindow.height
		)) {
			return true;
		}
	}
	if (fishWindow.toggled) {
		if ((
			prevX + 1 >= fishWindow.x &&
			prevX + 1 < fishWindow.x + fishWindow.width &&
			prevY + 1 >= fishWindow.y &&
			prevY + 1 < fishWindow.y + fishWindow.height
		)) {
			return true;
		}
	}
	return false;
}

function runCommand(command) {
	switch (command) {
		case "/online":

	}
}

function gameLoop() {
	var gridchatWidth = 80;
	var gridchatHeight = 24;
	var grid = [];
	var playerX = Math.floor(gridchatWidth / 2);
	var playerY = Math.floor(gridchatHeight / 2);

	tiles = loadGraphicsFromANSI("spritesheet.ans");

	// Initialize grid with empty values
	for (var y = 0; y < gridchatHeight; y++) {
		grid[y] = [];
		for (var x = 0; x < gridchatWidth; x++) {
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

	var messageLength = 0;
	var message = '';
	var messages = [];

	var typedMessage = '';
	var lastTypedMessage = '';
	var lines = 0;
	var lastLines = 0;

	console.gotoxy(1, 1);
	for (var y = 0; y < gridchatHeight; y++) {
		for (var x = 0; x < gridchatWidth; x++) {
			console.print(grid[y][x]);
		}
		console.crlf();
	}


	nodeTalk.addNode(nodeTalk.userNode); // Add self to online nodes. Don't know why this fixes a bug for some users
	nodeTalk.broadcastDiscover(); //Will also discover self for echo now

	while (running) {

		// Get input
		var mk = mouse_getkey(K_NONE, 100, true);
		var key = mk.key;
		
		if (!windowConflict(playerX, playerY)) {
			console.gotoxy(playerX + 1, playerY + 1); // Move cursor to highlight player every frame
		} else {
			offScreenCursor();
		}

		if (messageLength != chatWindow.messages.length) {
			if (chatWindow.toggled) {
				chatWindow.drawMessages();
				messageLength = chatWindow.messages.length;
				// Only redraw if new message is detected
			}
		}

		try {
			message = system.get_node_message(nodeTalk.userNode);
			if (message === null) {
				messages = [];
			} else {
				messages = message.split("\x1b");
			}
		} catch (e) {
			messages = [];
		}



		for(var i = 0; i < messages.length; i=i+3) {
			if (!(messages[i] === '' || messages[i] === null)) {
				if (messages[i] === "\x7fDISCOVER\x7f") {
					if (!(nodeTalk.checkDuplicateNode(messages[i-1]))) {
						nodeTalk.broadcastAcknowledge(messages[i-1]);
						nodeTalk.addNode(messages[i-1]);
					}
				} else {
					chatWindow.addMessage(messages[i-1], messages[i]);
				}
			}
		}

		// Debug TODO: Remove
		if (debug) {
			console.gotoxy(1, 27);
			for(var i=0; i < messages.length; i++) {
				console.print(messages[i] + " ");
			}
			console.gotoxy(1, 28);
			console.gotoxy(1, 26);
			for (var i=0; i < nodeTalk.nodesOnline.length; i++) {
				console.print(nodeTalk.nodesOnline[i] + " ");
			}
		}

		if (mk) {	
			if (typeof mk === 'object' && mk.mouse) {
				// Handle mouse input
				if (mk.mouse.action === 1) { // Left click
					var mx = mk.mouse.column - 1;
					var my = mk.mouse.row - 1;
					if (mx >= 0 && mx < gridchatWidth && my >= 0 && my < gridchatHeight) {
						prevX = playerX;
						prevY = playerY;
						playerX = mx;
						playerY = my;
					}
				}
			} else {
				if (chatWindow.typeToggled) { // If typing is toggled, do not move player
					switch (key) {
						case '\r':
						case '\n':
						case '\x0D':
						case '\x0A':
							chatWindow.setTypeToggled(false);

							if (typedMessage.length > 0) {
								if (typedMessage.charAt(0) === '/') {
									runCommand(typedMessage);
								} else {
									if (nodeTalk.currentUser.handle === '') {
										nodeTalk.sendMessage(typedMessage, nodeTalk.currentUser.alias);
									} else {
										nodeTalk.sendMessage(typedMessage, nodeTalk.currentUser.handle);
									}
								}	
							}
							typedMessage = ''; // Clear message after sending
							chatWindow.drawMessages();
							break;
						case '\x1b': // Escape key
						// Just exit typing mode without doing sending message
							chatWindow.setTypeToggled(false);
							break;
						case '\b':
						case '\x7f':							
						if (typedMessage.length > 0) {
								typedMessage = typedMessage.slice(0, -1);
							}
							break;
						case KEY_DEL:
						case '\x1b[3~': // Delete key variants
							if (typedMessage.length > 0) {
								typedMessage = typedMessage.slice(0, typedMessage.length - 1);
							}
							break;
					}
					if (chatWindow.typeToggled === true) {
						lines = chatWindow.calculateMessageLines(nodeTalk.currentUser.handle, typedMessage);
						if (lastTypedMessage != typedMessage || lastLines != lines) {
							chatWindow.drawMessages(lines+1);
						} // Only redraw if the message is deleted. This is to prevent multiple seperation lines.
						if (checkSingleCharacter(key)) {
							typedMessage += key;
						}
						lastTypedMessage = typedMessage;
						lastLines = lines;
						chatWindow.drawTypedMessage(nodeTalk.currentUser.handle, typedMessage);
					}
					
					// TODO: Move cursor to where next character will be added
					// For now:
					offScreenCursor();

				} else {
					switch (key) {
						case "f":
							fishWindow.toggled = fishWindow.display(staticGrid);
							offScreenCursor();
							redrawPlayer(playerX, playerY); // Will not draw if toggled
							break;
							break;
						case KEY_UP:
						case 'w':
							if (playerY > 0) {
								prevY = playerY;
								prevX = playerX;
								playerY--;
								// Redraw previous position
								if (!windowConflict(playerX, playerY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100); // 100ms pause after move
							}
							break;
						case KEY_DOWN:
						case 's':
							if (playerY < gridchatHeight - 1) {
								prevY = playerY;
								prevX = playerX;
								playerY++;
								// Redraw previous position
								if (!windowConflict(playerX, playerY - 1)) {

									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100); // 100ms pause after move
							}
							break;
						case KEY_LEFT: 
						case 'a':
							if (playerX > 1) {
								prevX = playerX;
								prevY = playerY;
								playerX -= 2;
								// Redraw previous position
								if (!windowConflict(prevX, prevY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100); // 100ms pause after move
								
							}
							break;
						case KEY_RIGHT:
						case 'd':
							if (playerX < gridchatWidth - 2) {
								prevX = playerX;
								prevY = playerY;
								playerX += 2;
								// Redraw previous position
								if (!windowConflict(prevX, prevY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100); // 100ms pause after move
							}
							break;
						case 'j':
							chatWindow.toggled = chatWindow.display(staticGrid);
							if (chatWindow.toggled) {
								chatWindow.drawMessages();
							}
							offScreenCursor();
							redrawPlayer(playerX, playerY); // Will not draw if toggled
							break;
						case '\r':
						case '\n':
						case '\x0D':
						case '\x0A': // Enter key variants, TODO: update to sys standard
							if (chatWindow.toggled) {
								chatWindow.setTypeToggled(true);
								chatWindow.drawMessages(2);
							}
							break;
						case '\x1b': // Escape key
							running = false;
							break;
					}
					console.clearkeybuffer(); // Used to prevent key buffering!!
				}
			}
		}
	}
	console.clear();
}

try {
	console.print("Press any key to play the Telefish. It's 'Trouta be fire'");
	console.pause();
	logo();
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
			if (options.sub === null) {
				alert("Error saving exception-message to: mail");
			} else {
				alert("Error saving exception-message to: " + options.sub);
			}
		}
		msgbase.close();
	}
}
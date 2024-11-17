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

var startX = 1;
var startY = 1;

var screenWidth = 80;
var screenHeight = 24;

var userNode = bbs.node_num;
var currentUser = new User(bbs.node_useron);
var telefish = currentUser.curxtrn // For ref, this is currently telefish but may change

var nodesOnline = [];

var typeToggled = false;


// Telefish global variables
var Window = load({}, "window.js");
var MessageWindow = load({}, "MessageWindow.js");

var chatWindow = new MessageWindow(30, 24, 1, 1);
chatWindow.setTitle("====Telefish  Node  Chat====");
var fishWindow = new Window(40, 10, 35, 10);
fishWindow.setTitle("=Currently waiting for a fish to bite=");



// TODO: Rename to messages
var sampleMessages = [];

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

function logo() {
	console.clear();
	show_image(telefish_title, false, 0);
	console.pause();
	console.clear();
}

function drawMessages(messages, messageAdjust) {
	if (messageAdjust === undefined) {
		messageAdjust = 0;
	}
	var maxWidth = chatWindow.width - 2;
	var maxMessages = chatWindow.height - 3; // Adjust for borders and title
	maxMessages = maxMessages - messageAdjust; // Adjust for message entry section.

	// Clear the chat area
	for (var y = 2; y < chatWindow.height - 1; y++) {
		console.gotoxy(startX + 1, startY + y);
		for (var x = 1; x < chatWindow.width - 1; x++) {
			console.print(' ');
		}
	}

	var allLines = [];

	// TODO: Sort messages by date in descending order

	// Process messages into lines
	for (var m = 0; m < messages.length; m++) {
		var message = messages[m];
		var user = message.author;
		var text = message.text;
		var formattedMessage = user + ": " + text;
		var words = formattedMessage.split(' ');
		var lines = [];
		var line = '';

		for (var i = 0; i < words.length; i++) {
			var word = words[i];

			while (word.length > maxWidth) {
				// Split the word if it's too long
				var part = word.substring(0, maxWidth);
				word = word.substring(maxWidth);
				if (line.length > 0) {
					lines.push(line);
					line = '';
				}
				lines.push(part);
			}

			if (line.length + word.length + (line.length > 0 ? 1 : 0) > maxWidth) {
				lines.push(line);
				line = word;
			} else {
				if (line.length > 0) line += ' ';
				line += word;
			}
		}
		if (line.length > 0) lines.push(line);

		allLines = allLines.concat(lines);
	}

	// Display the most recent messages
	var startLine = Math.max(0, allLines.length - maxMessages);
	var yPosition = 2;

	for (var i = startLine; i < allLines.length && yPosition < chatWindow.height - 1; i++) {
		console.gotoxy(startX + 1, startY + yPosition);
		console.print(allLines[i]);
		yPosition++;
	}
}

function checkSingleCharacter(key) {
	var commonKeys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 `~!@#$%^&*()-_=+[]{}|;:\'",.<>/?\\'.split('');
	if (typeof key === 'string' && key.length === 1) {
		var isCommonKey = false;
		for (var i = 0; i < commonKeys.length; i++) {
			if (commonKeys[i] === key) {
				isCommonKey = true;
				break;
			}
		}
		if (!isCommonKey) {
			return false;
		}
		return key;
	}
	return false;
}

function redrawGrid(staticGrid) {
	for (var y = 0; y < screenHeight; y++) {
		console.gotoxy(startX, startY + y);
		for (var x = 0; x < screenWidth; x++) {
			if (staticGrid[y] && staticGrid[y][x]) {
				console.print(staticGrid[y][x]);
			} else {
				console.print(' ');
			}
		}
	}
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

function offScreenCursor() {
	console.gotoxy(200, 200); // Move cursor off screen
}

function runCommand(command) {
	switch (command) {
		case "/online":

	}
}

function probeNode(node) {
	var targetNode = new User(node);
	if (targetNode.curxtrn === telefish) {
		return true;
	} else {
		//nodesOnline.splice(nodesOnline.indexOf(node), 1);
		return false;
	}
}

// Ask all nodes to discover themselves, including self
function broadcastDiscover() {
	for(var i = 0; i < system.nodes; i++) {
		if (probeNode(i) && !checkDuplicateNode(i)) {
			system.put_node_message(i, "\x1bTF\x1b"+userNode+"\x1b"+"\x7fDISCOVER\x7f");
		}
	}
}

function checkDuplicateNode(node) {
	for(var i = 0; i < nodesOnline.length; i++) {
		if (parseInt(node) === parseInt(nodesOnline[i])) {
			return true;
		}
	}
	return false;
}

// Acknowledge the node that sent the discover message, not including self or already acknowledged nodes
function broadcastAcknowledge(node) {
	if (checkDuplicateNode(node)) {
		return;
	}
	system.put_node_message(node, "\x1bTF\x1b"+userNode+"\x1b"+"\x7fDISCOVER\x7f");
}


function sendMessage(message, name) {
	for(var i = 0; i < nodesOnline.length; i++) {
		system.put_node_message(nodesOnline[i], "\x1bTF\x1b"+name+"\x1b"+message);
	}
}

function gameLoop() {
	var gridchatWidth = 80;
	var gridchatHeight = 24;
	var grid = [];
	var playerX = Math.floor(gridchatWidth / 2);
	var playerY = Math.floor(gridchatHeight / 2);

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


	nodesOnline.push(userNode); // Add self to online nodes. Don't know why this fixes a bug for some users
	broadcastDiscover(); //Will also discover self for echo now

	while (running) {

		// Get input
		var mk = mouse_getkey(K_NONE, 100, true);
		var key = mk.key;
		
		if (!windowConflict(playerX, playerY)) {
			console.gotoxy(playerX + 1, playerY + 1); // Move cursor to highlight player every frame
		} else {
			offScreenCursor();
		}

		if (messageLength != sampleMessages.length) {
			if (chatWindow.toggled) {
				drawMessages(sampleMessages);
				messageLength = sampleMessages.length;
				// Only redraw if new message is detected
			}
		}

		try {
			message = system.get_node_message(userNode);
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
					if (!(checkDuplicateNode(messages[i-1]))) {
						broadcastAcknowledge(messages[i-1]);
						nodesOnline.push(messages[i-1]);
					}
				} else {
					unixTime = time();
					sampleMessages.push({ text: messages[i], author: messages[i-1], date: unixTime});
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
			for (var i=0; i < nodesOnline.length; i++) {
				console.print(nodesOnline[i] + " ");
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
				if (typeToggled) { // If typing is toggled, do not move player
					switch (key) {
						case '\r':
						case '\n':
						case '\x0D':
						case '\x0A':
							typeToggled = false;

							if (typedMessage.length > 0) {
								if (typedMessage.charAt(0) === '/') {
									runCommand(typedMessage);
								} else {
									if (currentUser.handle === '') {
										sendMessage(typedMessage, currentUser.alias);
									} else {
										sendMessage(typedMessage, currentUser.handle);
									}
								}	
							}
							typedMessage = ''; // Clear message after sending
							drawMessages(sampleMessages);
							break;
						case '\x1b': // Escape key
						// Just exit typing mode without doing sending message
							typeToggled = false;
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
					if (typeToggled === true) {
						lines = chatWindow.calculateMessageLines(currentUser.handle, typedMessage);
						if (lastTypedMessage != typedMessage || lastLines != lines) {
							drawMessages(sampleMessages, lines+1);
						} // Only redraw if the message is deleted. This is to prevent multiple seperation lines.
						if (checkSingleCharacter(key)) {
							typedMessage += key;
						}
						lastTypedMessage = typedMessage;
						lastLines = lines;
						chatWindow.drawTypedMessage(currentUser.handle, typedMessage);
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
								drawMessages(sampleMessages);
							}
							offScreenCursor();
							redrawPlayer(playerX, playerY); // Will not draw if toggled
							break;
						case '\r':
						case '\n':
						case '\x0D':
						case '\x0A': // Enter key variants, TODO: update to sys standard
							if (chatWindow.toggled) {
								typeToggled = true;
								drawMessages(sampleMessages, 2);
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

// Consts
const title = "Telefish";
const author = "greenturtle537";
const REVISION = "$Revision: 0.1 $".split(' ')[1];
const tear_line = "\r\n--- " + js.exec_file + " " + REVISION + "\r\n";
const ini_section = "telefish"; // ini file section


var options = load({}, "modopts.js", ini_section);

// Telefish options
var chatWidth = 30;
var chatHeight = 24;
var startX = 1;
var startY = 1;

// Telefish global variables

var sampleMessages = [
	{ text: "Hello everyone!", author: "User1", date: "12000001012023" },
	{ text: "How's it going?", author: "User2", date: "12150002012023" },
	{ text: "Anyone up for a game?", author: "User3", date: "12300003012023" },
	{ text: "Nice to meet you all!", author: "User4", date: "12450004012023" },
	{ text: "What's the plan for today?", author: "User5", date: "13000005012023" },
	{ text: "I'm new here.", author: "User6", date: "13150006012023" },
	{ text: "Can someone help me?", author: "User7", date: "13300007012023" },
	{ text: "Great job on the project!", author: "User8", date: "13450008012023" },
	{ text: "Let's catch up later.", author: "User9", date: "14000009012023" },
	{ text: "Goodbye for now!", author: "User10", date: "14150010012023" },
	{ text: "This is an extra long message to test how the chat system handles messages that exceed the typical length.", author: "User11", date: "14300011012023" }
];

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

function dispChat(chatToggle, staticGrid) {
	if (!chatToggle) {
		// Draw chat region
		drawChatRegion();
		return true;
	} else {
		// Redraw region
		redrawRegion(staticGrid);
		return false;
	}
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

function drawChatRegion() {
	// Draw top border
	console.gotoxy(startX, startY);
	console.print('+');
	for (var x = 1; x < chatWidth - 1; x++) {
		console.print('-');
	}
	console.print('+');

	// Draw sides and fill inside with spaces
	for (var y = 1; y < chatHeight - 1; y++) {
		console.gotoxy(startX, startY + y);
		console.print('|');
		for (var x = 1; x < chatWidth - 1; x++) {
			console.print(' ');
		}
		console.print('|');
	}

	// Draw bottom border
	console.gotoxy(startX, startY + chatHeight - 1);
	console.print('+');
	for (var x = 1; x < chatWidth - 1; x++) {
		console.print('-');
	}
	console.print('+');

	// Draw title
	console.gotoxy(startX + 1, startY + 1);
	console.print('====Telefish  Node  Chat====');

	drawMessages(sampleMessages);
}

function drawTypedMessage(user, message) {
	var maxWidth = chatWidth - 2;
	var formattedMessage = user + ": " + message;
	var words = formattedMessage.split(' ');
	var lines = [];
	var line = '';
	for (var i = 0; i < words.length; i++) {
		if (line.length + words[i].length + (line.length > 0 ? 1 : 0) > maxWidth) {
			lines.push(line);
			line = words[i];
		} else {
			if (line.length > 0) line += ' ';
			line += words[i];
		}
	}
	if (line.length > 0) lines.push(line);
	var startLine = startY + chatHeight - 1 - lines.length;
	for (var i = 0; i < lines.length; i++) {
		console.gotoxy(startX + 1, startLine + i);
		for (var x = 1; x < chatWidth - 1; x++) {
			console.print(' ');
		}
		console.gotoxy(startX + 1, startLine + i);
		console.print(lines[i]);
	}

	if (message) {
		var yPosition = startY + chatHeight - lines.length - 2;
		console.gotoxy(startX + 1, yPosition);
		for (var x = 1; x < chatWidth - 1; x++) {
			console.print('-');
		}
	}
}

function drawMessages(messages) {
	var maxMessageWidth = chatWidth - 4; // Adjust for borders and padding
	var maxMessages = chatHeight - 4; // Adjust for borders and title
	var maxMessages = maxMessages - 2; // Adjust for message entry section.

	// Clear the chat area
	for (var y = 2; y < chatHeight - 2; y++) {
		console.gotoxy(startX + 1, startY + y);
		for (var x = 1; x < chatWidth - 1; x++) {
			console.print(' ');
		}
	}

	var messageLines = [];

	// TODO: Sort messages by date in descending order

	// Process messages into lines
	for (var i = 0; i < messages.length; i++) {
		var message = messages[i];
		var formattedMessage = message.author + ": " + message.text;
		var words = formattedMessage.split(' ');
		var line = '';

		for (var j = 0; j < words.length; j++) {
			if (line.length + words[j].length + 1 > maxMessageWidth) {
				messageLines.push(line);
				line = words[j];
			} else {
				if (line.length > 0) {
					line += ' ';
				}
				line += words[j];
			}
		}
		if (line.length > 0) {
			messageLines.push(line);
		}
	}

	// Display the most recent messages
	var startLine = Math.max(0, messageLines.length - maxMessages);
	for (var y = 2; y < chatHeight - 2 && startLine < messageLines.length; y++) {
		console.gotoxy(startX + 1, startY + y);
		console.print(messageLines[startLine]);
		startLine++;
	}
}

function checkSingleCharacter(key) {
	if (typeof key === 'string' && key.length === 1) {
		return key;
	}
	return false;
}

function redrawRegion(staticGrid) {
	for (var y = 0; y < chatHeight; y++) {
		console.gotoxy(startX, startY + y);
		for (var x = 0; x < chatWidth; x++) {
			if (staticGrid[y] && staticGrid[y][x]) {
				console.print(staticGrid[y][x]);
			} else {
				console.print(' ');
			}
		}
	}
}

function redrawPlayer(playerX, playerY, chatToggle) {
	if (chatConflict(playerX, playerY, chatToggle)) {
		offScreenCursor();
	} else {
		console.gotoxy(playerX + 1, playerY + 1);
		console.print('@');
		console.gotoxy(playerX + 1, playerY + 1);
	}
}

function chatConflict(prevX, prevY, chatToggle) {
	if (chatToggle) {
		if ((
			prevX + 1 >= startX &&
			prevX + 1 < startX + chatWidth &&
			prevY + 1 >= startY &&
			prevY + 1 < startY + chatHeight
		)) {
			return true;
		}
	}
	return false;
}

function offScreenCursor() {
	console.gotoxy(200, 200); // Move cursor off screen
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

	var chatToggle = false;
	var typeToggled = false;

	var messageLength = 0;

	var typedMessage = '';

	console.gotoxy(1, 1);
	for (var y = 0; y < gridchatHeight; y++) {
		for (var x = 0; x < gridchatWidth; x++) {
			console.print(grid[y][x]);
		}
		console.crlf();
	}

	while (running) {

		// Get input
		var mk = mouse_getkey(K_NONE, 100, true);
		var key = mk.key;
		
		if (!chatConflict(playerX, playerY, chatToggle)) {
			console.gotoxy(playerX + 1, playerY + 1); // Move cursor to highlight player every frame
		} else {
			offScreenCursor();
		}

		if (messageLength != sampleMessages.length) {
			drawMessages(sampleMessages);
			messageLength = sampleMessages.length;
			// Only redraw if new message is detected
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
						case '\x0A': // Enter key variants, TODO: update to sys standard
							typeToggled = false;
							//TODO: Send message
							break;
						case '\x1b': // Escape key
						// Just exit typing mode without doing sending message
							typeToggled = false;
							break;
						case '\b':
						case '\x7f':
							if (typedMessage.length > 0) {
							typedMessage = typedMessage.slice(0, -1);
							console.gotoxy(startX + 1, startY + chatHeight - 1);
							for (var x = 1; x < chatWidth - 1; x++) {
								console.print(' ');
							}
							console.gotoxy(startX + 1, startY + chatHeight - 1);
							console.print(typedMessage);
							}
							break;
						case KEY_DEL:
						case '\x1b[3~': // Delete key variants
							if (typedMessage.length > 0) {
								// Remove character at the cursor position
								typedMessage = typedMessage.slice(0, typedMessage.length - 1);
								console.gotoxy(startX + 1, startY + chatHeight - 1);
								for (var x = 1; x < chatWidth - 1; x++) {
									console.print(' ');
								}
								console.gotoxy(startX + 1, startY + chatHeight - 1);
								console.print(typedMessage);
							}
							break;
					}
					if (checkSingleCharacter(key)) {
						typedMessage += key;
						console.gotoxy(startX + 1, startY + chatHeight - 1);
						console.print(typedMessage);
					}
					drawTypedMessage("You", typedMessage);
					// Do not use console.clearkeybuffer(); here to preserve fast typing.
				} else {
					switch (key) {
						case KEY_UP:
						case 'w':
							if (playerY > 0) {
								prevY = playerY;
								prevX = playerX;
								playerY--;
								// Redraw previous position
								if (!chatConflict(playerX, playerY - 1, chatToggle)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY, chatToggle);
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
								if (!chatConflict(playerX, playerY - 1, chatToggle)) {

									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY, chatToggle);
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
								if (!chatConflict(prevX, prevY - 1, chatToggle)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY, chatToggle);
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
								if (!chatConflict(prevX, prevY - 1, chatToggle)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY, chatToggle);
								sleep(100); // 100ms pause after move
							}
							break;
						case 'j':
							chatToggle = dispChat(chatToggle, staticGrid);
							offScreenCursor();
							redrawPlayer(playerX, playerY, chatToggle); // Will not draw if toggled
							break;
						case '\r':
						case '\n':
						case '\x0D':
						case '\x0A': // Enter key variants, TODO: update to sys standard
							typeToggled = true;
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
			if (options.sub === null) {
				alert("Error saving exception-message to: mail");
			} else {
				alert("Error saving exception-message to: " + options.sub);
			}
		}
		msgbase.close();
	}
}

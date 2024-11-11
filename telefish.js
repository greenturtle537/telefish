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

var userNode = bbs.node_num;
var currentUser = new User(bbs.node_useron);
var telefish = currentUser.curxtrn

// Telefish global variables

var sampleMessages = [
	{ text: "Hello everyone!", author: "User1", date: "1672531200" },
	{ text: "How's it going?", author: "User2", date: "1672536900" },
	{ text: "Anyone up for a game?", author: "User3", date: "1672542600" },
	{ text: "Nice to meet you all!", author: "User4", date: "1672548300" },
	{ text: "What's the plan for today?", author: "User5", date: "1672554000" },
	{ text: "I'm new here.", author: "User6", date: "1672559700" },
	{ text: "Can someone help me?", author: "User7", date: "1672565400" },
	{ text: "Great job on the project!", author: "User8", date: "1672571100" },
	{ text: "Let's catch up later.", author: "User9", date: "1672576800" },
	{ text: "Goodbye for now!", author: "User10", date: "1672582500" },
	{ text: "This is an extra long message to test how the chat system handles messages that exceed the typical length.", author: "User11", date: "1672588200" }
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

	var startLine = startY + chatHeight - 1 - lines.length;
	for (var i = 0; i < lines.length; i++) {
		console.gotoxy(startX + 1, startLine + i);
		for (var x = 1; x < chatWidth - 1; x++) {
			console.print(' ');
		}
		console.gotoxy(startX + 1, startLine + i);
		console.print(lines[i]);
	}

	// Separate from existing chat
	var yPosition = startY + chatHeight - lines.length - 2;
	console.gotoxy(startX + 1, yPosition);
	for (var x = 1; x < chatWidth - 1; x++) {
		console.print('-');
	}
}

function drawMessages(messages, messageAdjust) {
	if (messageAdjust === undefined) {
		messageAdjust = 0;
	}
	var maxMessageWidth = chatWidth - 4; // Adjust for borders and padding
	var maxMessages = chatHeight - 3; // Adjust for borders and title
	var maxMessages = maxMessages - messageAdjust; // Adjust for message entry section.

	// Clear the chat area
	for (var y = 2; y < chatHeight - 1; y++) {
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
	for (var y = 2; y < chatHeight - 1 && startLine < messageLines.length; y++) {
		console.gotoxy(startX + 1, startY + y);
		console.print(messageLines[startLine]);
		startLine++;
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
	var lastTypedMessage = '';

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

		var message = '';
		var messages = [];
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
				unixTime = time();
				sampleMessages.push({ text: messages[i], author: messages[i-1], date: unixTime});
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
								system.put_node_message(userNode, "\x1bTF\x1b"+currentUser.alias+"\x1b"+typedMessage); //Use non-typeable esc characters to separate messages
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
						if (lastTypedMessage != typedMessage) {
							drawMessages(sampleMessages, 2);
						} // Only redraw if the message is deleted. This is to prevent multiple seperation lines.
						if (checkSingleCharacter(key)) {
							typedMessage += key;
						}
						lastTypedMessage = typedMessage;
						drawTypedMessage("You", typedMessage);
					}
					
					// TODO: Move cursor to where next character will be added
					// For now:
					offScreenCursor();

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
							drawMessages(sampleMessages, 2);
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

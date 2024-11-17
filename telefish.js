// Consts
const title = "Telefish";
const author = "greenturtle537";
const REVISION = "$Revision: 0.1 $".split(' ')[1];
const tear_line = "\r\n--- " + js.exec_file + " " + REVISION + "\r\n";
const ini_section = "telefish";
const telefish_title = js.exec_dir + "telefish.ans";
const telefish_title_xbin = js.exec_dir + "telefish.xbin";

var debug = false;

var options = load({}, "modopts.js", ini_section);

var screenWidth = 80;
var screenHeight = 24;

var userNode = bbs.node_num;
var currentUser = new User(bbs.node_useron);
var telefish = currentUser.curxtrn;

var nodesOnline = [];

var typeToggled = false;

var Window = load({}, "window.js");
var chatWindow = new Window(30, 24, 1, 1);
var fishWindow = new Window(40, 10, 20, 1);

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

function dispChat(staticGrid) {
	chatWindow.toggle();
	chatWindow.dispWindow(staticGrid);
	if (chatWindow.toggled) {
		chatWindow.setTitle('====Telefish  Node  Chat====');
		chatWindow.drawTitle(chatWindow.title);
	}
}

function dispFish(staticGrid) {
	fishWindow.toggle();
	fishWindow.dispWindow(staticGrid);
	if (fishWindow.toggled) {
		fishWindow.setTitle('=Currently waiting for a fish to bite=');
		fishWindow.drawTitle(fishWindow.title);
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

function drawTypedMessage(user, message) {
	var maxWidth = chatWindow.width - 2;
	var formattedMessage = user + ": " + message;
	var words = formattedMessage.split(' ');
	var lines = [];
	var line = '';

	for (var i = 0; i < words.length; i++) {
		var word = words[i];

		while (word.length > maxWidth) {
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

	var startLine = chatWindow.y + chatWindow.height - 1 - lines.length;
	for (var i = 0; i < lines.length; i++) {
		console.gotoxy(chatWindow.x + 1, startLine + i);
		for (var x = 1; x < chatWindow.width - 1; x++) {
			console.print(' ');
		}
		console.gotoxy(chatWindow.x + 1, startLine + i);
		console.print(lines[i]);
	}

	var yPosition = chatWindow.y + chatWindow.height - lines.length - 2;
	console.gotoxy(chatWindow.x + 1, yPosition);
	for (var x = 1; x < chatWindow.width - 1; x++) {
		console.print('-');
	}
	return lines.length;
}

function calculateMessageLines(user, message) {
	var maxWidth = chatWindow.width - 2;
	var formattedMessage = user + ": " + message;
	var words = formattedMessage.split(' ');
	var lines = [];
	var line = '';

	for (var i = 0; i < words.length; i++) {
		var word = words[i];

		while (word.length > maxWidth) {
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

	return lines.length;
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
	var maxMessages = chatWindow.height - 3;
	maxMessages = maxMessages - messageAdjust;

	for (var y = 2; y < chatWindow.height - 1; y++) {
		console.gotoxy(chatWindow.x + 1, chatWindow.y + y);
		for (var x = 1; x < chatWindow.width - 1; x++) {
			console.print(' ');
		}
	}

	var allLines = [];

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

	var startLine = Math.max(0, allLines.length - maxMessages);
	var yPosition = 2;

	for (var i = startLine; i < allLines.length && yPosition < chatWindow.height - 1; i++) {
		console.gotoxy(chatWindow.x + 1, chatWindow.y + yPosition);
		console.print(allLines[i]);
		yPosition++;
	}
}

function checkSingleCharacter(key) {
	var commonKeys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 `~!@#$%^&*()-_=+[]{}|;:\'",.<>/?\\'.split('');
	if (typeof key === 'string' && key.length === 1) {
		return commonKeys.includes(key) ? key : false;
	}
	return false;
}

function redrawGrid(staticGrid) {
	for (var y = 0; y < screenHeight; y++) {
		console.gotoxy(1, y + 1);
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
		if (
			prevX + 1 >= chatWindow.x &&
			prevX + 1 < chatWindow.x + chatWindow.width &&
			prevY + 1 >= chatWindow.y &&
			prevY + 1 < chatWindow.y + chatWindow.height
		) {
			return true;
		}
	}
	if (fishWindow.toggled) {
		if (
			prevX + 1 >= fishWindow.x &&
			prevX + 1 < fishWindow.x + fishWindow.width &&
			prevY + 1 >= fishWindow.y &&
			prevY + 1 < fishWindow.y + fishWindow.height
		) {
			return true;
		}
	}
	return false;
}

function offScreenCursor() {
	console.gotoxy(200, 200);
}

function runCommand(command) {
	switch (command) {
		case "/online":
			break;
	}
}

function probeNode(node) {
	var targetNode = new User(node);
	if (targetNode.curxtrn === telefish) {
		return true;
	} else {
		return false;
	}
}

function broadcastDiscover() {
	for (var i = 0; i < system.nodes; i++) {
		if (probeNode(i) && !checkDuplicateNode(i)) {
			system.put_node_message(i, "\x1bTF\x1b" + userNode + "\x1b" + "\x7fDISCOVER\x7f");
		}
	}
}

function checkDuplicateNode(node) {
	return nodesOnline.includes(parseInt(node));
}

function broadcastAcknowledge(node) {
	if (checkDuplicateNode(node)) {
		return;
	}
	system.put_node_message(node, "\x1bTF\x1b" + userNode + "\x1b" + "\x7fDISCOVER\x7f");
}

function sendMessage(message, name) {
	for (var i = 0; i < nodesOnline.length; i++) {
		system.put_node_message(nodesOnline[i], "\x1bTF\x1b" + name + "\x1b" + message);
	}
}

function gameLoop() {
	var gridWidth = screenWidth;
	var gridHeight = screenHeight;
	var grid = [];
	var playerX = Math.floor(gridWidth / 2);
	var playerY = Math.floor(gridHeight / 2);

	for (var y = 0; y < gridHeight; y++) {
		grid[y] = [];
		for (var x = 0; x < gridWidth; x++) {
			grid[y][x] = '.';
		}
	}

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
	for (var y = 0; y < gridHeight; y++) {
		for (var x = 0; x < gridWidth; x++) {
			console.print(grid[y][x]);
		}
		console.crlf();
	}

	nodesOnline.push(userNode);
	broadcastDiscover();

	while (running) {
		var mk = mouse_getkey(K_NONE, 100, true);
		var key = mk.key;

		if (!windowConflict(playerX, playerY)) {
			console.gotoxy(playerX + 1, playerY + 1);
		} else {
			offScreenCursor();
		}

		if (messageLength != sampleMessages.length) {
			if (chatWindow.toggled) {
				drawMessages(sampleMessages);
				messageLength = sampleMessages.length;
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

		for (var i = 0; i < messages.length; i = i + 3) {
			if (!(messages[i] === '' || messages[i] === null)) {
				if (messages[i] === "\x7fDISCOVER\x7f") {
					if (!checkDuplicateNode(messages[i - 1])) {
						broadcastAcknowledge(messages[i - 1]);
						nodesOnline.push(messages[i - 1]);
					}
				} else {
					unixTime = time();
					sampleMessages.push({ text: messages[i], author: messages[i - 1], date: unixTime });
				}
			}
		}

		if (debug) {
			console.gotoxy(1, 27);
			for (var i = 0; i < messages.length; i++) {
				console.print(messages[i] + " ");
			}
			console.gotoxy(1, 28);
			console.gotoxy(1, 26);
			for (var i = 0; i < nodesOnline.length; i++) {
				console.print(nodesOnline[i] + " ");
			}
		}

		if (mk) {
			if (typeof mk === 'object' && mk.mouse) {
				if (mk.mouse.action === 1) {
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
				if (typeToggled) {
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
							typedMessage = '';
							drawMessages(sampleMessages);
							break;
						case '\x1b':
							typeToggled = false;
							break;
						case '\b':
						case '\x7f':
							if (typedMessage.length > 0) {
								typedMessage = typedMessage.slice(0, -1);
							}
							break;
						case KEY_DEL:
						case '\x1b[3~':
							if (typedMessage.length > 0) {
								typedMessage = typedMessage.slice(0, typedMessage.length - 1);
							}
							break;
					}
					if (typeToggled === true) {
						lines = calculateMessageLines(currentUser.handle, typedMessage);
						if (lastTypedMessage != typedMessage || lastLines != lines) {
							drawMessages(sampleMessages, lines + 1);
						}
						if (checkSingleCharacter(key)) {
							typedMessage += key;
						}
						lastTypedMessage = typedMessage;
						lastLines = lines;
						drawTypedMessage(currentUser.handle, typedMessage);
					}

					offScreenCursor();

				} else {
					switch (key) {
						case "f":
							dispFish(staticGrid);
							offScreenCursor();
							redrawPlayer(playerX, playerY);
							break;
						case KEY_UP:
						case 'w':
							if (playerY > 0) {
								prevY = playerY;
								prevX = playerX;
								playerY--;
								if (!windowConflict(playerX, playerY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100);
							}
							break;
						case KEY_DOWN:
						case 's':
							if (playerY < gridHeight - 1) {
								prevY = playerY;
								prevX = playerX;
								playerY++;
								if (!windowConflict(playerX, playerY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100);
							}
							break;
						case KEY_LEFT:
						case 'a':
							if (playerX > 1) {
								prevX = playerX;
								prevY = playerY;
								playerX -= 2;
								if (!windowConflict(prevX, prevY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100);
							}
							break;
						case KEY_RIGHT:
						case 'd':
							if (playerX < gridWidth - 2) {
								prevX = playerX;
								prevY = playerY;
								playerX += 2;
								if (!windowConflict(prevX, prevY - 1)) {
									console.gotoxy(prevX + 1, prevY + 1);
									console.print(grid[prevY][prevX]);
								}
								redrawPlayer(playerX, playerY);
								sleep(100);
							}
							break;
						case 'j':
							dispChat(staticGrid);
							offScreenCursor();
							redrawPlayer(playerX, playerY);
							break;
						case '\r':
						case '\n':
						case '\x0D':
						case '\x0A':
							if (chatWindow.toggled) {
								typeToggled = true;
								drawMessages(sampleMessages, 2);
							}
							break;
						case '\x1b':
							running = false;
							break;
					}
					console.clearkeybuffer();
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

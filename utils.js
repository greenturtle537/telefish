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

function offScreenCursor() {
	console.gotoxy(200, 200); // Move cursor off screen
}
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

		// Get input using console.getkey
		var key = console.getkey(K_NONE);

		if (key) {
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
	console.clear();
}

function getCharAtPos(x, y) {
	// Move the cursor to position (x, y)
	console.gotoxy(x, y);
	// Calculate the index in the screen buffer
	var index = (y - 1) * console.screen_columns + (x - 1);

	// Get the character at that position
	var charAtPosition = console.screen_buf[index];
	return charAtPosition;
}
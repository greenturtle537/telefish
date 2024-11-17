var Window = load({}, "window.js");

function MessageWindow(width, height, x, y) {
    Window.call(this, width, height, x, y);
    this.messages = [];
    this.typeToggled = false;
}

MessageWindow.prototype = Object.create(Window.prototype);
MessageWindow.prototype.constructor = MessageWindow;

MessageWindow.prototype.typeToggle = function() {
    this.typeToggled = !this.typeToggled;
};

MessageWindow.prototype.setTypeToggle = function(newToggle) {
    this.typeToggled = newToggle;
};

MessageWindow.prototype.addMessage = function(user, message) {
    unixTime = time();
    this.messages.push({ text: message, author: user, date: unixTime});
}

MessageWindow.prototype.drawMessages = function(messageAdjust) {
    if (messageAdjust === undefined) {
        messageAdjust = 0;
    }
    var maxWidth = this.width - 2;
    var maxMessages = this.height - 3; // Adjust for borders and title
    maxMessages = maxMessages - messageAdjust; // Adjust for message entry section.

    // Clear the chat area
    for (var y = 2; y < this.height - 1; y++) {
        console.gotoxy(this.x + 1, this.y + y);
        for (var x = 1; x < this.width - 1; x++) {
            console.print(' ');
        }
    }

    var allLines = [];

    // TODO: Sort messages by date in descending order

    // Process messages into lines
    for (var m = 0; m < this.messages.length; m++) {
        var message = this.messages[m];
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

    for (var i = startLine; i < allLines.length && yPosition < this.height - 1; i++) {
        console.gotoxy(this.x + 1, this.y + yPosition);
        console.print(allLines[i]);
        yPosition++;
    }
};

MessageWindow.prototype.calculateMessageLines = function(user, message) {
    var maxWidth = this.width - 2;
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
};

MessageWindow.prototype.drawTypedMessage = function(user, message) {
    var maxWidth = this.width - 2;
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

    var startLine = this.y + this.height - 1 - lines.length;
    for (var i = 0; i < lines.length; i++) {
        console.gotoxy(this.x + 1, startLine + i);
        for (var x = 1; x < this.width - 1; x++) {
            console.print(' ');
        }
        console.gotoxy(this.x + 1, startLine + i);
        console.print(lines[i]);
    }

    var yPosition = this.y + this.height - lines.length - 2;
    console.gotoxy(this.x + 1, yPosition);
    for (var x = 1; x < this.width - 1; x++) {
        console.print('-');
    }
    return lines.length;
};

/* Leave as last line for convenient load() usage: */
MessageWindow;
var Window = load({}, "window.js");

function MessageWindow(width, height, x, y) {
    Window.call(this, width, height, x, y);
    this.messages = [];
}

MessageWindow.prototype = Object.create(Window.prototype);
MessageWindow.prototype.constructor = MessageWindow;

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
var Window = load({}, "window.js");

function MessageWindow(width, height, x, y) {
    Window.call(this, width, height, x, y);
    this.messages = [];
}

MessageWindow.prototype = Object.create(Window.prototype);
MessageWindow.prototype.constructor = MessageWindow;

MessageWindow.prototype.addMessage = function(message) {
    this.messages.push(message);
};

MessageWindow.prototype.drawMessages = function() {
    for (var i = 0; i < this.messages.length; i++) {
        var messageY = this.y + 2 + i;
        if (messageY < this.y + this.height - 1) {
            console.gotoxy(this.x + 1, messageY);
            console.print(this.messages[i]);
        }
    }
};

MessageWindow.prototype.display = function() {
    this.draw();
    this.drawTitle(this.title);
    this.drawMessages();
};

/* Leave as last line for convenient load() usage: */
MessageWindow;
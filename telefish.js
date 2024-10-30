try {

	console.log(hi)
	exit(0);
	
} catch(e) {
	
	var msg = file_getname(e.fileName) + 
		" line " + e.lineNumber + 
		": " + e.message;
	if(js.global.console) {
		console.crlf();
	}
	alert(msg);
	if(options.sub && user.alias != author) {
		var msgbase = new MsgBase(options.sub);
		var hdr = { 
			to: author,
			from: user.alias || system.operator,
			subject: title
		};
		msg += tear_line;
		if(!msgbase.save_msg(hdr, msg)) {
			alert("Error saving exception-message to: " + options.sub);
		}
		msgbase.close();
	}
}
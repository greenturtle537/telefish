// Consts
const title = "Telefish";
const author = "greenturtle537";
const REVISION = "$Revision: 0.1 $".split(' ')[1];
const tear_line = "\r\n--- " + js.exec_file + " " + REVISION + "\r\n";

const test = js.exec_dir + "test.bin";

function show_image(filename, fx, delay)
{
	var dir = directory(filename);
	filename = dir[random(dir.length)];
	var Graphic = load({}, "graphic.js");
	var sauce_lib = load({}, "sauce_lib.js");
	var sauce = sauce_lib.read(filename);
	if(delay === undefined)
		delay = options.image_delay;
	if(sauce && sauce.datatype == sauce_lib.defs.datatype.bin) {
		try {
			var graphic = new Graphic(sauce.cols, sauce.rows);
			graphic.load(filename);
			if(fx && graphic.revision >= 1.82)
				graphic.drawfx('center', 'center');
			else
				graphic.draw('center', 'center');
			sleep(delay);
		} catch(e) { 
			log(LOG_DEBUG, e);
		}
	}
}

try {

	console.print("The game is still being built. Please wait. It's 'Trouta be fire' ");
	
	console.pause();
	exit(0);

} catch(e) {
	
	var msg = file_getname(e.fileName) + 
		" line " + e.lineNumber + 
		": " + e.message;
	if(js.global.console) {
		console.crlf();
	}
	alert(msg);
	if(user.alias != author) {
		var msgbase = new MsgBase('mail');
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
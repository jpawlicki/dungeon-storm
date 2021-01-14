window.onerror = function (msg, url, lineNo, columnNo, error) {
  var string = msg.toLowerCase();
  var substring = "script error";
  if (string.indexOf(substring) > -1){
    alert('Script Error: See Browser Console for Detail');
  } else {
    var message = [
      'Message: ' + msg,
      'URL: ' + url,
      'Line: ' + lineNo,
      'Column: ' + columnNo,
      'Error object: ' + JSON.stringify(error)
    ].join(' - ');

    alert(message);

		if (window.location.protocol != "file:") {
			let req = new XMLHttpRequest();
			req.open("POST", "https://dungeon-storm.uk.r.appspot.com/crash_report");
			req.setRequestHeader("API-Key", "DS Telemetry");
			req.send(message);
		}
  }

  return false;
};

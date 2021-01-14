const http = require("http");
const datastore = require("@google-cloud/datastore");
const db = new datastore.Datastore();

async function handle(request, response) {
	let req = new URL(request.url, "http://" + request.headers.host);
	let path = req.pathname;
	if (path == "/metric_report") {
		if (request.method == "OPTIONS") {
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
			response.setHeader("Access-Control-Allow-Headers", "API-Key");
			response.writeHead(204);
			response.end();
			return;
		} else if (request.method == "POST") {
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
			response.setHeader("Access-Control-Allow-Headers", "API-Key");
			if (request.headers["api-key"] != "DS Telemetry") {
				response.writeHead(403);
				response.end();
				return;
			}
			response.writeHead(204);
			let reqbody = "";
			request.on("data", c => reqbody += c);
			request.on("end", async () => {
				response.end();
				await db.save({
					key: db.key("metric"),
					data: {
						timestamp: new Date(),
						report: reqbody,
					},
				});
			});
			return;
		} else if (request.method == "GET") {
			response.writeHead(200);
			let [entries] = await db.runQuery(db.createQuery("metric").order("timestamp", {descending: true}).limit(10000));
			response.end(JSON.stringify(entries.map(e => { return {"time": e.timestamp, "report": e.report}})));
			return;
		}
	} else if (path == "/crash_report" && request.method == "POST") {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
		response.setHeader("Access-Control-Allow-Headers", "API-Key");
		if (request.headers["api-key"] != "DS Telemetry") {
			response.writeHead(403);
			response.end();
			return;
		}
		response.writeHead(204);
		// Log an error containing the crash report so that appengine logging picks it up.
		let data = "";
		request.on("data", c => data += c);
		request.on("end", () => {
			console.error(data);
			response.end();
		});
		return;
	}
	response.writeHead(404);
	response.end();
}

const server = http.createServer();
server.on("request", handle);
server.listen(process.env.PORT ? process.env.PORT : 8080);

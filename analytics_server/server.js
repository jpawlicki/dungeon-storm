const http = require("http");
const datastore = require("@google-cloud/datastore");
const {ErrorReporting} = require("@google-cloud/error-reporting");
const db = new datastore.Datastore();
const errors = new ErrorReporting();

async function handle(request, response) {
	let req = new URL(request.url, "http://" + request.headers.host);
	let path = req.pathname;
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	response.setHeader("Access-Control-Allow-Headers", "API-Key");

	// OPTIONS handling.
	if (request.method == "OPTIONS") {
		response.writeHead(204);
		response.end();
		return;
	}

	// API-Key requirement. If you're reading this, you can make up your own and post on the github project so that we know who you are.
	if (!request.headers.hasOwnProperty("api-key")) {
		response.writeHead(403);
		response.end("You must use an API Key. Open an issue on the github project to get one.");
		return;
	}

	// Metric report / read handling.
	if (path == "/metric_report") {
		if (request.method == "POST") {
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
	}

	// Community rooms handling.
	if (path == "/community_room") {
		if (request.method == "POST") {
			response.writeHead(200);
			let reqbody = "";
			request.on("data", c => reqbody += c);
			request.on("end", async () => {
				await db.save({
					key: db.key("community_room"),
					data: {
						timestamp: new Date(),
						contents: reqbody,
					},
				});
				let [entries] = await db.runQuery(db.createQuery("community_room").limit(1000));
				response.end(JSON.stringify({"unreviewed": entries.length}));
			});
			return;
		} else if (request.method == "GET") {
			response.writeHead(200);
			let [entries] = await db.runQuery(db.createQuery("community_room").limit(1000));
			response.end(JSON.stringify({"unreviewed": entries.length}));
			return;
		}
	}

	// Crash report handling.
	if (path == "/crash_report") {
		if (request.method == "POST") {
			response.writeHead(204);
			let data = "";
			request.on("data", c => data += c);
			request.on("end", () => {
				errors.report(data);
				response.end();
			});
			return;
		}
	}
	response.writeHead(404);
	response.end();
}

const server = http.createServer();
server.on("request", handle);
server.listen(process.env.PORT ? process.env.PORT : 8080);

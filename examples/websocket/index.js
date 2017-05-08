const ReqRep = require('../../');
const WebSocket = require('ws');

server();
client();

//
//
// Client
function client() {
	const reqRep = new ReqRep();

	const ws = new WebSocket('ws://localhost:8080');

	ws.on('open', () => {
		sendRequest();
		sendRequest();
		sendRequest();
	});

	ws.on('message', message => {
		const rep = JSON.parse(message);

		reqRep.handle(rep);
	});

	function sendRequest() {
		const req = { text: 'Hello' };

		reqRep.request(req, (err, rep) => {
			if (err) { return console.error(err); }

			console.log(rep);
		});

		ws.send(JSON.stringify(req));
	}
}

//
//
// Server
function server() {
	const reqRep = new ReqRep();

	const wss = new WebSocket.Server({
		port: 8080
	});

	wss.on('connection', ws => {
		ws.on('message', message => {
			const req = JSON.parse(message);

			const rep = { text: `${req.text}, World!` };

			reqRep.reply(req, rep);

			ws.send(JSON.stringify(rep));
		});
	});

	setTimeout(() => wss.close(), 1000);
}

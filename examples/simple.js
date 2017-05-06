const ReqRep = require('../');

const reqRep = new ReqRep({ mutate: false, timeout: 10000, prune: 1000 });

// On the client:
const req = reqRep.request({ msg: 'Hello' }, (err, rep) => {
	if (err) { return console.error(err); }

	console.log(rep);
});

// ...send the request to the server...


// On the server:
const rep = reqRep.reply(req, { msg: `${req.msg}, World!` });

// ...send the reply to the client...


// On the client:
reqRep.handle(rep);

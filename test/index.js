
const assert = require('chai').assert;

const ReqRep = require('../');

describe('ReqRep', function () {

	it('mutates a request message', function () {
		const reqRep = new ReqRep();

		const msg = { a: 1 };

		const req = reqRep.request(msg, (err, rep) => {});

		assert.equal(req, msg);
	});

	it('creates a request message without mutating the original message', function () {
		const reqRep = new ReqRep({ mutate: false });

		const msg = { a: 1 };

		const req = reqRep.request(msg, (err, rep) => {});

		assert.notEqual(req, msg);
	});

	it('mutates a reply message', function () {
		const reqRep = new ReqRep();

		const msg = { a: 1 };

		const req = reqRep.request({}, (err, rep) => {});
		const rep = reqRep.reply(req, msg);

		assert.equal(rep, msg);
	});

	it('creates a reply message without mutating the original message', function () {
		const reqRep = new ReqRep({ mutate: false });

		const msg = { a: 1 };

		const req = reqRep.request({}, (err, rep) => {});
		const rep = reqRep.reply(req, msg);

		assert.notEqual(rep, msg);
	});

	it('handles a reply message by calling the request callback', function (done) {
		const reqRep = new ReqRep();

		const msg = { a: 1 };

		const req = reqRep.request({}, (err, rep) => {
			assert.ok(rep);
			done();
		});
		const rep = reqRep.reply(req, msg);
		reqRep.handle(rep);
	});

	it('handles a reply message by calling the request callback without mutating', function (done) {
		const reqRep = new ReqRep({ mutate: false });

		const msg = { a: 1 };

		const req = reqRep.request({}, (err, rep) => {
			assert.ok(rep);
			done();
		});
		const rep = reqRep.reply(req, msg);
		reqRep.handle(rep);
	});

	it('handles a request message without a req field', function () {
		const reqRep = new ReqRep();

		const rep = reqRep.reply({}, {});

		assert.ok(rep);
	});

	it('handles a reply message without a rep field', function () {
		const reqRep = new ReqRep();

		const rep = reqRep.handle({});

		assert.ok(rep);
	});

	it('handles a reply message without a correplying callback', function () {
		const reqRep = new ReqRep();

		const rep = reqRep.handle({ rep: 1 });

		assert.ok(rep);
	});

	it('accepts and applies a req option', function () {
		const reqRep = new ReqRep({ req: 'syn' });

		const req = reqRep.request({}, (err, rep) => {});

		assert.isDefined(req.syn);
	});

	it('accepts and applies a rep option', function () {
		const reqRep = new ReqRep({ rep: 'ack' });

		const req = reqRep.request({}, (err, rep) => {});
		const rep = reqRep.reply(req, {});

		assert.isDefined(rep.ack);
	});

	it('times out', function (done) {
		const reqRep = new ReqRep({ timeout: 10, prune: 20 });

		const req = reqRep.request({}, (err, rep) => {
			assert.isNotNull(err);
			done();
		});
	});

});

'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var utils = require('./utils');

/**
Create a sox command
*/
var SoxCommand = function(input, options) {

	if (!(this instanceof SoxCommand)) {
		return new SoxCommand();
	}

	EventEmitter.call(this);

	if (typeof input === 'object' && !('readable' in input)) {
		// Options object passed directly
		options = input;
	} else {
		// Input passed first
		options = options || {};
		options.source = input;
	}

	// Add input if present
	this._inputs = [];
	if (options.source) {
		this.input(options.source);
	}

	this._outputs = [];
	this.output();

	this._effects = [];

	this._global = utils.args();

	this.options = options;

};

util.inherits(SoxCommand, EventEmitter);
module.exports = SoxCommand;


/* exports == module.exports
exports is an alias for module.exports
exports.new_thing will add a new thing to the module.exports
but exports = new_thing will overwrite exports with this new thing, and it will no longer be an alias for module.exports
*/


/* Add methods from options submodules */
require('./options/input')(SoxCommand.prototype);
require('./options/output')(SoxCommand.prototype);
require('./options/effect')(SoxCommand.prototype);

/* Add processor methods */
require('./processor')(SoxCommand.prototype);

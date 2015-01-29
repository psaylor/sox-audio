'use strict';

var EventEmitter = require('events').EventEmitter;

/**
Create a sox command
*/
var SoxCommand = function (input) {

	if (!(this instanceof SoxCommand)) {
		return new SoxCommand();
	}

	EventEmitter.call(this);

	var options = {};
	options.source = input;

	this._input = [];
	if (options.source) {
		this.input(options.source);
	}

	this._outputs = [];

	this.options = options;

};



var convertFileSox = function (rawFileName, saveToFileName) {
	console.log(util.format("Transcoding %s to %s", rawFileName, saveToFileName));
	var COMMAND_FORMAT = 'sox -r 44100 -e signed -b 16 -c 1 %s -r %d %s';
	var commandLine = util.format(COMMAND_FORMAT, rawFileName, DEFAULT_SAMPLE_RATE, saveToFileName);
	var command = exec(commandLine, logAll);
};


/* exports == module.exports
exports is an alias for module.exports
exports.new_thing will add a new thing to the module.exports
but exports = new_thing will overwrite exports with this new thing, and it will no longer be an alias for module.exports
*/

module.exports = SoxCommand;

/*
Add methods from options submodules
*/
require('./options/input')(SoxCommand.prototype);
require('./options/output')(SoxCommand.prototype);

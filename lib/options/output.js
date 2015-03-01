'use strict';

var utils = require('../utils');

/* Output-related methods */

module.exports = function(proto) {

	proto.output = function(target, pipeopts) {
		var isFile = false;
		var isStream = false;
		var isSoxPipe = false;

		if (!target) {
			throw new Error('Invalid output, no target provided');
		}

		if (target && typeof target !== 'string') {
			if (!('writable' in target) || !(target.writable)) {
				throw new Error('Invalid output');
			}
			isStream = true;
		} else if (typeof target === 'string') {
			if (target === '-p' || target === '-' || target === '--sox-pipe') {
				isSoxPipe = true;
			} else {
				isFile = true;
			}
		}

		this._currentOutput = {
			target: target,
			isFile: isFile,
			isStream: isStream,
			isSoxPipe: isSoxPipe,
			pipeopts: pipeopts || {},
			options: utils.args()
		};
		this._outputs.push(this._currentOutput);

		return this;
	};

	proto.outputSampleRate = function(sampleRate) {
		this._currentOutput.options('-r', sampleRate);
		return this;
	};

	/* Specify the number of bits in each encoded sample */
	proto.outputBits = function(bitRate) {
		this._currentOutput.options('-b', bitRate);
		return this;
	};

	proto.outputEncoding = function(encoding) {
		this._currentOutput.options('-e', encoding);
		return this;
	};

	proto.outputChannels = function(numChannels) {
		this._currentOutput.options('-c', numChannels);
		return this;
	};

	proto.outputFileType = function(fileType) {
		this._currentOutput.options('-t', fileType);
		return this;
	};

};
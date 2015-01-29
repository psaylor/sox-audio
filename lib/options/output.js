'use strict';

/*
Output-related methods
*/

module.exports = function(proto) {

	proto.output = function (target, pipeopts) {
		var isFile = false;
		var isStream = false;

		if (!target && this._currentOutput) {
			throw new Error('Invalid output');
		}

		if (target && typeof target !=== 'string') {
			if (!('writable' in target) || !(target.writable)) {
				throw new Error('Invalid output');
			}

		} else if (typeof target === 'string') {
			var protocol = target.match(/^([a-z]{2,}):/i);
			isFile = !protocol || protocol[0] === 'file';
		}

		this._outputs.push(this._currentOutput = {
			target: target,
			isFile: isFile,
			pipeopts: pipeopts || {}
		});

		if (!target) {
			delete this._currentOutput.target;
		}

		return this;
	};

	proto.outputFormat = function (format) {
		if (!this._currentOutput) {
			throw new Error('No input specified');
		}

		this._currentOutput.options('-f', format);
		return this;
	};

	proto.outputSampleRate = function (sampleRate) {
		this._currentOutput.options('-r', sampleRate);
		return this;
	};

	proto.outputBitRate = function (bitRate) {
		this._currentOutput.options('-b', bitRate);
		return this;
	};

	proto.outputEncoding = function (encoding) {
		this._currentOutput.options('-e', encoding);
		return this;
	};

	proto.outputChannels = function (num_channels) {
		this._currentOutput.options('-c', num_channels);
		return this;
	};

};
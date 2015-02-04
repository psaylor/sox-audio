'use strict';

var utils = require('../utils');

/*
Output-related methods
*/

module.exports = function(proto) {

	proto.output = function (target, pipeopts) {
		var isFile = false;
		var isStream = false;
		var isSoxPipe = false;

		if (!target && this._currentOutput) {
			throw new Error('Invalid output');
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

		if (target && !('target' in this._currentOutput)) {
			this._currentOutput.target = target;
			this._currentOutput.isFile = isFile;
			this._currentOutput.pipeopts = pipeopts || {};
		} else {
			// if (target && typeof target !== 'string') {
			// 	var hasOutputStream = this._outputs.some()
			// }

			this._currentOutput = {
				target: target,
				isFile: isFile,
				isStream: isStream,
				isSoxPipe: isSoxPipe,
				pipeopts: pipeopts || {},
				options: utils.args()
			};
			this._outputs.push(this._currentOutput);

			if (!target) {
				delete this._currentOutput.target;
			}
		}

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

	proto.outputFileType = function (file_type) {
		this._currentOutput.options('-t', file_type);
		return this;
	};

};
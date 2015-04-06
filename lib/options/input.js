'use strict';

var utils = require('../utils');

/* Input-related methods */

module.exports = function(proto) {

	proto.input = function(inputSource) {
		var isFile = false;
		var isStream = false;

		if (typeof inputSource !== 'string') {
			if (!('readable' in inputSource) || !(inputSource.readable)){
				throw new Error('Invalid input');
			}
			isStream = true;
			// inputSource.pause();

		} else {
			isFile = true;
		}

		this._currentInput = {
			source: inputSource,
			isFile: isFile,
			isStream: isStream,
			isSubCommand: false,
			options: utils.args()
		};

		this._inputs.push(this._currentInput);

		return this;
	};

	proto.inputSubCommand = function(inputCommand) {
		var isSubCommand = false;
		var isFile = false;

		if (inputCommand instanceof proto.constructor) {
			console.log('Input a subcommand SoxCommand');
			isSubCommand = true;

		} else {
			throw new Error('Invalid input subcommand: must be instance of SoxCommand');
		}
		
		this._currentInput = {
			source: inputCommand,
			isFile: isFile,
			isStream: false,
			isSubCommand: isSubCommand,
			options: utils.args()
		};

		this._inputs.push(this._currentInput);
		return this;
	};

	proto.inputSampleRate = function(sampleRate) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}
		if (this._currentInput.isSubCommand) {
			throw new Error('Cannot add options to a SubCommand input');
		}

		this._currentInput.options('-r', sampleRate);
		return this;
	};

	/* Specify the number of bits in each encoded sample */
	proto.inputBits = function(bitRate) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}
		if (this._currentInput.isSubCommand) {
			throw new Error('Cannot add options to a SubCommand input');
		}

		this._currentInput.options('-b', bitRate);
		return this;
	};

	proto.inputEncoding = function(encoding) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}
		if (this._currentInput.isSubCommand) {
			throw new Error('Cannot add options to a SubCommand input');
		}

		this._currentInput.options('-e', encoding);
		return this;
	};

	proto.inputChannels = function(numChannels) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}
		if (this._currentInput.isSubCommand) {
			throw new Error('Cannot add options to a SubCommand input');
		}

		this._currentInput.options('-c', numChannels);
		return this;
	};

	proto.inputFileType = function(fileType) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}
		if (this._currentInput.isSubCommand) {
			throw new Error('Cannot add options to a SubCommand input');
		}

		this._currentInput.options('-t', fileType);
		return this;
	};

};
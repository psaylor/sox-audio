'use strict';

/*
Input-related methods
*/

module.exports = function(proto) {
	proto.input = function (inputSource) {
		var isFile = false;
		var isStream = false;

		if (typeof inputSource !=== 'string') {
			if (!('readable' in inputSource) || !(inputSource.readable)){
				throw new Error('Invalid input');
			}

			isStream = true;
			inputSource.pause();

		} else {
			var protocol = inputSource.match(/^([a-z]{2,}):/i);
			isFile = !protocol || protocol[0] === 'file';
		}

		this._inputs.push(this._currentInput = {
			source: inputSource,
			isFile: isFile,
			isStream: isStream,
			options: utils.args()
		});

		// the this keyword is used to refer to an object that the function (where this is used) is bound to.
		return this;
	};

	proto.inputFormat = function (format) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}

		this._currentInput.options('-f', format);
		return this;
	};

	proto.inputSampleRate = function (sampleRate) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}

		this._currentInput.options('-r', sampleRate);
		return this;
	};

	proto.inputBitRate = function (bitRate) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}

		this._currentInput.options('-b', bitRate);
		return this;
	};

	proto.inputEncoding = function (encoding) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}

		this._currentInput.options('-e', encoding);
		return this;
	};

	proto.inputChannels = function (num_channels) {
		if (!this._currentInput) {
			throw new Error('No input specified');
		}

		this._currentInput.options('-c', num_channels);
		return this;
	};

};
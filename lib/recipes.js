'use strict';

module.exports = function recipes(proto) {

	/* Creates a SoxCommand for resampling input to ouput, according to the 
	* provided options, which can optionally specify inputSampleRate, 
	* inputEncoding, inputBitRate, inputChannels, and outputSampleRate
	*/
	proto.transcode = function(input, output, options) {
		options = options || {};

		this.input(input)
			.inputSampleRate(options.inputSampleRate || 44100)
			.inputEncoding(options.inputEncoding || 'signed')
			.inputBitRate(options.inputBitRate || 16)
			.inputChannels(options.inputChannels || 1)
			.output(output)
			.outputSampleRate(options.outputSampleRate || 16000);
		return this;
	};
};

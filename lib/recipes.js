'use strict';

module.exports = function recipes(proto) {
	proto.transcode = function(input, output, outputSampleRate) {
		this.input(input)
			.inputSampleRate(44100)
			.inputEncoding('signed')
			.inputBitRate(16)
			.inputChannels(1)
			.output(output)
			.outputSampleRate(outputSampleRate);
		return this;
	};
};
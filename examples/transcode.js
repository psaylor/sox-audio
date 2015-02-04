var SoxCommand = require('../index');


var rawInputFileName = './assets/utterance_0.raw'
var outputFileName = './outputs/utterance_0_transcoded.wav'

console.log("Transcoding %s to %s", rawInputFileName, outputFileName);


var SOX_COMMAND_LINE_EXAMPLE = 'sox -r 44100 -e signed -b 16 -c 1 input.raw -r 16000 output.wav';

var command = SoxCommand(rawInputFileName)
	// .input(rawInputFileName)
	.inputSampleRate(44100)
	.inputEncoding('signed')
	.inputBitRate(16)
	.inputChannels(1)
	.output(outputFileName)
	.outputSampleRate(outputSampleRate);
command.run();


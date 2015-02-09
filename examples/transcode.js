var SoxCommand = require('../index');
var fs = require('fs');
var spawn = require('child_process').spawn;
var through = require('through');

var rawInputFileName = './assets/utterance_0.raw';
var outputFileName = './outputs/transcoded44.wav';
var outputFileStream = fs.createWriteStream('./outputs/stream_transcoded.wav');

var INPUT_SAMPLE_RATE = 44100;
var outputSampleRate = 16000;

console.log("Transcoding %s to %s", rawInputFileName, outputFileName);


var SOX_COMMAND_LINE_EXAMPLE = 'sox -r 44100 -e signed -b 16 -c 1 input.raw -r 16000 output.wav';

// var command = SoxCommand(rawInputFileName)
// 	.inputSampleRate(INPUT_SAMPLE_RATE)
// 	.inputEncoding('signed')
// 	.inputBits(16)
// 	.inputChannels(1)
// 	.output(outputFileName)
// 	.outputSampleRate(outputSampleRate);
// command.run();

/* Streaming example */

console.log("Streaming transcoding of %s to %s", rawInputFileName, outputFileName);


// Cat stdout: 589824 bytes


var rawInputStream = fs.createReadStream(rawInputFileName);
rawInputStream.pause();

var wavInputFileName = './assets/utterance_0.wav';
var wavInputStream = fs.createReadStream(wavInputFileName);
wavInputStream.pause();


var data_counter = 0;
var throughStream = through(
	function write(data) {
		data_counter += data.length;
		console.log("A: Writing through data ", data.length);
		this.queue(data);
	},
	function end () {
		console.log("A: END: wrote through data ", data_counter);
		this.queue(null);
	});

// rawInputStream.pipe(throughStream);
// throughStream.pipe(outputFileStream);

var streamCommand = SoxCommand();

/* raw */
streamCommand.input(rawInputStream)
	.inputSampleRate(INPUT_SAMPLE_RATE)
	.inputEncoding('signed')
	.inputBits(16)
	.inputChannels(1)
	.inputFileType('raw')
	.output(outputFileStream)
	.outputFileType('wav')
	.outputSampleRate(outputSampleRate);


streamCommand.on('start', function(command) {
	console.log('Spawned sox process with command ', command);
});

// streamCommand.on('prepare', function(args) {
// 	console.log('Preparing sox command with args ' + args.join(' '));
// });

streamCommand.on('error', function(err, stdout, stderr) {
	console.log('Cannot process audio: ' + err.message);
    console.log("Command Stdout: ", stdout);
    console.log("Command Stderr: ", stderr)
});

streamCommand.on('end', function() {
	console.log('Sox command finished');
	// rawInputStream.close();
	// outputFileStream.close();
});

streamCommand.run();



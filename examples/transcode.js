var SoxCommand = require('../index');
var fs = require('fs');
var spawn = require('child_process').spawn;
var through = require('through');

/* All the provided raw assets have 44.1k sample rate */
var INPUT_SAMPLE_RATE = 44100;
/* You can change the sample rate of the output */
var OUTPUT_SAMPLE_RATE = 16000;

/* This command will transcode a raw signed PCM 16-bit file sampled at 44.1k to
a PCM 16-bit wav file sampled at 16k */
var SOX_COMMAND_LINE_EXAMPLE = 'sox -r 44100 -e signed -b 16 -c 1 input.raw -r 16000 output.wav';

var addStandardListeners = function(command) {
	command.on('prepare', function(args) {
		console.log('Preparing sox command with args ' + args.join(' '));
	});

	command.on('start', function(commandLine) {
		console.log('Spawned sox with command ' + commandLine);
	});

	command.on('progress', function(progress) {
	    console.log('Processing progress: ', progress);
	});

	command.on('error', function(err, stdout, stderr) {
	    console.log('Cannot process audio: ' + err.message);
	    console.log('Sox Command Stdout: ', stdout);
	    console.log('Sox Command Stderr: ', stderr)
	});

	command.on('end', function() {
	    console.log('Sox command succeeded!');
	});
};

/* Transcodes a raw 44.1k wav file to have another file type (generally wav) and
a different sample rate (in this case 16k) */
var transcodeFile = function(rawInputFileName, outputSampleRate, outputFileName) {
	var command = SoxCommand(rawInputFileName)
		.inputSampleRate(INPUT_SAMPLE_RATE)
		.inputEncoding('signed')
		.inputBits(16)
		.inputChannels(1)
		.output(outputFileName)
		.outputSampleRate(outputSampleRate);
	addStandardListeners(command);
	command.run();	
};

/* Streaming examples */

var genThroughStreamCounter = function() {
	var dataCounter = 0;
	var throughStream = through(
		function write(data) {
			dataCounter += data.length;
			console.log("ThroughStreamCounter: Writing through data ", data.length);
			this.queue(data);
		},
		function end () {
			console.log("ThroughStreamCounter: END. Wrote through data ", dataCounter);
			this.queue(null);
		});
	return throughStream;
};

/* Transcodes a raw input stream from 41k to 16k, streaming out a 16k wav file
to outputPipe. Optionally pass useThrough = true to insert a through stream
between the rawInputStream and the SoxCommand to count and print the bytes of data */
var transcodeRawStream = function(rawInputStream, outputSampleRate, outputPipe, useThrough) {
	useThrough = useThrough || false;
	var inputStream = rawInputStream;

	if (useThrough) {
		var throughStreamCounter = genThroughStreamCounter();
		rawInputStream.pipe(throughStreamCounter);
		inputStream = throughStreamCounter;
	}

	var command = SoxCommand();
	command.input(inputStream)
		.inputSampleRate(INPUT_SAMPLE_RATE)
		.inputEncoding('signed')
		.inputBits(16)
		.inputChannels(1)
		.inputFileType('raw')
		.output(outputPipe)
		.outputFileType('wav')
		.outputSampleRate(outputSampleRate);

	addStandardListeners(command);
	command.run();
};

/* Transcodes a wav input stream from 41k to 16k, streaming out a 16k wav file
to outputPipe. Optionally pass useThrough = true to insert a through stream
between the wavInputStream and the SoxCommand to count and print the bytes of data */
var transcodeWavStream = function(wavInputStream, outputSampleRate, outputPipe, useThrough) {
	useThrough = useThrough || false;
	var inputStream = wavInputStream;

	if (useThrough) {
		var throughStreamCounter = genThroughStreamCounter();
		wavInputStream.pipe(throughStreamCounter);
		inputStream = throughStreamCounter;
	}

	var command = SoxCommand();
	command.input(inputStream)
		.inputSampleRate(INPUT_SAMPLE_RATE)
		.inputEncoding('signed')
		.inputBits(16)
		.inputChannels(1)
		.inputFileType('wav')
		.output(outputPipe)
		.outputFileType('wav')
		.outputSampleRate(outputSampleRate);

	addStandardListeners(command);
	command.run();
};


var runExamples = function() {
	var rawInputFileName = './assets/utterance_0.raw';
	var wavInputFileName = './assets/utterance_0.wav';

	var outputFileName1 = './outputs/transcoded.wav';
	var outputFileName2 = './outputs/rawstream_transcoded.wav';
	var outputFileName3 = './outputs/wavstream_transcoded.wav';

	console.log("Transcoding %s to %s", rawInputFileName, outputFileName1);
	transcodeFile(rawInputFileName, OUTPUT_SAMPLE_RATE, outputFileName1);

	console.log("\nStreaming transcoding of %s to %s", rawInputFileName, outputFileName2);
	var rawInputStream = fs.createReadStream(rawInputFileName);
	var outputFileStream2 = fs.createWriteStream(outputFileName2);
	transcodeRawStream(rawInputStream, OUTPUT_SAMPLE_RATE, outputFileStream2);

	console.log("\nStreaming transcoding of %s to %s", rawInputFileName, outputFileName3);
	var wavInputStream = fs.createReadStream(wavInputFileName);
	var outputFileStream3 = fs.createWriteStream(outputFileName3);
	transcodeWavStream(wavInputStream, OUTPUT_SAMPLE_RATE, outputFileStream3);
};

runExamples();



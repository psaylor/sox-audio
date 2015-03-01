var SoxCommand = require('../index');

var util = require('util');
var fs = require('fs');
var Stream = require('stream');
var TimeFormat = SoxCommand.TimeFormat;

var addStandardListeners = function(command) {
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

/* Concatenate all audio files in the list, and save the result in outputFileName */
var concatenateExample = function(fileNameList, outputFileName) {
	var command = SoxCommand();
	fileNameList.forEach(function addInput(fileName) {
		command.input(fileName);
	});
	command.output(outputFileName)
		.concat();

	addStandardListeners(command);
	command.run()
	return command;
}

/* Concatenate all audio files in the list, trimming the first and last files.
* The first file is trimmed to start at startTimeSeconds, and the last file is
* trimmed to end at endTimeSeconds. The trimming is done by passing as input a
* string to execute an internal sox command ('|sox ...') which does the trim.
* The output is saved in outputFileName */
var concatenateAndTrimExample = function(fileNameList, startTimeSeconds, endTimeSeconds, outputFileName) {

	var command = SoxCommand();

	var startTimeFormatted = TimeFormat.formatTimeAbsolute(startTimeSeconds);
	var endTimeFormatted = TimeFormat.formatTimeAbsolute(endTimeSeconds);

	var trimFirstFileSubCommand = util.format(
		'|sox %s -t wav -p trim %s', 
		fileNameList[0], 
		startTimeFormatted);

	var trimLastFileSubCommand = util.format(
		'|sox %s -t wav -p trim 0 %s', 
		fileNameList[fileNameList.length - 1], 
		endTimeFormatted);

	command.input(trimFirstFileSubCommand);
	fileNameList.slice(1, -1).forEach(function(fileName) {
		command.input(fileName);
	});
	command.input(trimLastFileSubCommand)
		.output(outputFileName)
		.concat();

	addStandardListeners(command);

	console.log('Command', command._getArguments());

	command.run();
	return command;
};

/* Concatenate all audio files in the list, trimming the first and last files.
* The first file is trimmed to start at startTimeSeconds, and the last file is
* trimmed to end at endTimeSeconds. The trimming is done by passing as input
* another SoxCommand object that is set up to just trim a certain file.
* Executing the main SoxCommand simultaneously executes the sub-SoxCommands.
The output is saved in outputFileName */
var concatenateAndTrimAnotherExample = function(fileNameList, startTimeSeconds, endTimeSeconds, outputFileName) {
	var command = SoxCommand();

	var startTimeFormatted = TimeFormat.formatTimeAbsolute(startTimeSeconds);
	var endTimeFormatted = TimeFormat.formatTimeAbsolute(endTimeSeconds);

	var trimFirstFileSubCommand = SoxCommand()
		.input(fileNameList[0])
		.output('-p')
		.outputFileType('wav')
		.trim(startTimeFormatted);

	var trimLastFileSubCommand = SoxCommand()
		.input(fileNameList[fileNameList.length - 1])
		.output('-p')
		.outputFileType('wav')
		.trim(0, endTimeFormatted);

	command.inputSubCommand(trimFirstFileSubCommand);

	fileNameList.slice(1, -1).forEach(function(fileName) {
		command.input(fileName);
	});
	command.inputSubCommand(trimLastFileSubCommand)
		.output(outputFileName)
		.concat();

	addStandardListeners(command);
	console.log('Command', command._getArguments());

	command.run();
	return command;
};

/* Concatenate all audio files in the list, streaming the result to outputPipe */
var concatenateAndPipeExample = function(fileNameList, outputPipe) {
	var command = SoxCommand();
	fileNameList.forEach(function addInput(fileName) {
		command.input(fileName);
	});
	command.output(outputPipe)
		.outputFileType('wav')
		.concat();

	addStandardListeners(command);
	command.run()
	return command;
};

var runExamples = function() {
	var fileNameList = ['./assets/utterance_0.wav', 
		'./assets/utterance_1.wav', './assets/utterance_2.wav'];
	var outputFileName = './outputs/triple_concatenation.wav';
	var outputFileName2 = './outputs/trim_and_concat.wav';
	var outputFileName3 = './outputs/trim_and_concat2.wav';
	var outputPipe = fs.createWriteStream('./outputs/concat_and_pipe.wav');

	console.log('\nConcatenate example ');
	concatenateExample(fileNameList, outputFileName);

	console.log('\nConcatenate and trim example');
	concatenateAndTrimExample(fileNameList, 4.03, 2.54, outputFileName2);

	console.log('\nAnother concatenate and trim example');
	concatenateAndTrimAnotherExample(fileNameList, 4.03, 2.54, outputFileName3);
	
	console.log('\nConcatenate and pipe example');
	concatenateAndPipeExample(fileNameList.slice(0, -1), outputPipe);
};

runExamples();
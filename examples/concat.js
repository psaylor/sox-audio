var SoxCommand = require('../index');

var util = require('util');
var fs = require('fs');
var Stream = require('stream');

var add_standard_listeners = function(command) {
	command.on('start', function(commandLine) {
		console.log("Spawned sox with command " + commandLine);
	});

	command.on('codecData', function(data) {
	    console.log('Input is ', data);
	});

	command.on('progress', function(progress) {
	    console.log('Processing progress: ', progress);
	});

	command.on('error', function(err, stdout, stderr) {
	    console.log('Cannot process audio: ' + err.message);
	    console.log("Command Stdout: ", stdout);
	    console.log("Command Stderr: ", stderr)
	});

	command.on('end', function() {
	    console.log('Sox command succeeded !');
	});
};

var concatenate_example = function(fileNameList, outputFileName) {
	var command = SoxCommand();
	fileNameList.forEach(function addInput(fileName) {
		command.input(fileName);
	});
	command.output(outputFileName)
		.concat();

	add_standard_listeners(command);
	command.run()
	return command;
}

var concatenate_and_trim_example = function(fileNameList, startTimeSeconds, endTimeSeconds, outputFileName) {
	var command = SoxCommand();

	var startTimeFormatted = command.format_time_absolute(startTimeSeconds);
	var endTimeFormatted = command.format_time_absolute(endTimeSeconds);

	var firstFileSubCommand = util.format('|sox %s -t wav -p trim %s', fileNameList[0], startTimeFormatted);
	var lastFileSubCommand = util.format('|sox %s -t wav -p trim 0 %s', fileNameList[fileNameList.length - 1], endTimeFormatted);

	command.input(firstFileSubCommand);
	fileNameList.slice(1, -1).forEach(function(fileName) {
		command.input(fileName);
	});
	command.input(lastFileSubCommand)
		.output(outputFileName)
		.concat();

	add_standard_listeners(command);

	console.log('Command', command._getArguments());

	command.run();
	return command;
};

var concatenate_and_trim_another_example = function(fileNameList, startTimeSeconds, endTimeSeconds, outputFileName) {
	var command = SoxCommand();

	var startTimeFormatted = command.format_time_absolute(startTimeSeconds);
	var endTimeFormatted = command.format_time_absolute(endTimeSeconds);

	var firstFileSubCommand = SoxCommand()
		.input(fileNameList[0])
		.output('-p')
		.outputFileType('wav')
		.trim(startTimeFormatted);

	var lastFileSubCommand = SoxCommand()
		.input(fileNameList[fileNameList.length - 1])
		.output('-p')
		.outputFileType('wav')
		.trim(0, endTimeFormatted);

	command.inputSubCommand(firstFileSubCommand);

	fileNameList.slice(1, -1).forEach(function(fileName) {
		command.input(fileName);
	});
	command.inputSubCommand(lastFileSubCommand)
		.output(outputFileName)
		.concat();

	add_standard_listeners(command);
	console.log('Command', command._getArguments());

	command.run();
	return command;
};

var concatenate_and_pipe_example = function(fileNameList, outputPipe) {
	var command = SoxCommand();
	fileNameList.forEach(function addInput(fileName) {
		command.input(fileName);
	});
	command.output(outputPipe)
		.outputFileType('wav')
		.concat();

	add_standard_listeners(command);
	command.run()
	return command;
};

var run_examples = function() {
	var fileNameList = ['./assets/utterance_0.wav', './assets/utterance_1.wav', './assets/utterance_2.wav'];
	var outputFileName = './outputs/triple_concatenation.wav';
	var outputFileName2 = './outputs/trim_and_concat.wav';
	var outputFileName3 = './outputs/trim_and_concat2.wav';
	var outputPipe = fs.createWriteStream('./outputs/concat_and_pipe.wav');


	concatenate_example(fileNameList, outputFileName);
	concatenate_and_trim_example(fileNameList, 4.03, 2.54, outputFileName2);
	concatenate_and_pipe_example(fileNameList.slice(0, -1), outputPipe);
	concatenate_and_trim_another_example(fileNameList, 4.03, 2.54, outputFileName3)
};

run_examples();
var SoxCommand = require('../index');
var util = require('util');
var fs = require('fs');

var ABSOLUTE_TIME_FORMAT = '=%d';

var cut_file_example = function(inputFile, startTimeSeconds, endTimeSeconds, outputFile) {
	var startTimeFormatted = util.format(ABSOLUTE_TIME_FORMAT, startTimeSeconds);
	var endTimeFormatted = util.format(ABSOLUTE_TIME_FORMAT, endTimeSeconds);

	var command = SoxCommand()
		.input(inputFile)
		.output(outputFile)
		.trim(startTimeFormatted, endTimeFormatted)
		.run();
	return command;
};

var cut_file_and_pipe_example = function(inputFile, startTimeSeconds, endTimeSeconds, outputPipe) {
	var startTimeFormatted = util.format(ABSOLUTE_TIME_FORMAT, startTimeSeconds);
	var endTimeFormatted = util.format(ABSOLUTE_TIME_FORMAT, endTimeSeconds);

	var command = SoxCommand()
		.input(inputFile)
		.output(outputPipe)
		.outputFileType('wav')
		.trim(startTimeFormatted, endTimeFormatted)
		.run();
	return command;
};

var run_examples = function () {
	var inputFile = './assets/utterance_0.wav';
	var outputFile = './outputs/utterance_0_cut.wav';
	var outputPipe = fs.createWriteStream('./outputs/utterance_0_cut2.wav');

	var startTime= 1.67;
	var endTime = 2.25;

	cut_file_example(inputFile, startTime, endTime, outputFile);
	cut_file_and_pipe_example(inputFile, startTime, endTime, outputPipe);
};

run_examples();

var SoxCommand = require('../index');
var util = require('util');
var fs = require('fs');
var TimeFormat = SoxCommand.TimeFormat;

/* Trims the input file to start at startTimeSeconds and end at endTimeSeconds,
where both times are relative to the beginning of the file (thus they are 
absolute times). The output is saved to outputFile. */
var trimFileExample = function(inputFile, startTimeSeconds, endTimeSeconds, outputFile) {
	var startTimeFormatted = TimeFormat.formatTimeAbsolute(startTimeSeconds);
	var endTimeFormatted = TimeFormat.formatTimeAbsolute(endTimeSeconds);

	var command = SoxCommand()
		.input(inputFile)
		.output(outputFile)
		.trim(startTimeFormatted, endTimeFormatted)
		.run();
	return command;
};

/* Trims the input file to start at startTimeSeconds and end at endTimeSeconds,
where both times are relative to the beginning of the file (thus they are 
absolute times). The output is piped in wav format to outputPipe */
var trimFileAndPipeExample = function(inputFile, startTimeSeconds, endTimeSeconds, outputPipe) {
	var startTimeFormatted = TimeFormat.formatTimeAbsolute(startTimeSeconds);
	var endTimeFormatted = TimeFormat.formatTimeAbsolute(endTimeSeconds);

	var command = SoxCommand()
		.input(inputFile)
		.output(outputPipe)
		.outputFileType('wav')
		.trim(startTimeFormatted, endTimeFormatted)
		.run();
	return command;
};

var runExamples = function () {
	var inputFile = './assets/utterance_0.wav';
	var outputFile = './outputs/utterance_0_cut.wav';
	var outputPipe = fs.createWriteStream('./outputs/utterance_0_cut2.wav');

	var startTime= 1.67;
	var endTime = 2.25;

	trimFileExample(inputFile, startTime, endTime, outputFile);
	trimFileAndPipeExample(inputFile, startTime, endTime, outputPipe);
};

runExamples();

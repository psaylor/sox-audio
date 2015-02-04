'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var utils = require('./utils');

/* Processor methods */

module.exports = function(proto) {

	proto._spawnSox = function(args, options, processCB, endCB) {

		utils.which('sox', function(err, soxPath) {
			if (err) {
				return endCB(err);
			} else if (!soxPath || soxPath.length === 0) {
				return endCB(new Error('Cannot find sox'));
			}

			var stdout = null;
			var stdoutClosed = false;

			var stderr = null;
			var stderrClosed = false;

			var soxProc = spawn(soxPath, args, options);

			if (soxProc.stderr && options.captureStderr) {
				soxProc.stderr.setEncoding('utf8');
			}

			soxProc.on('error', function(err) {
				endCB(err);
			});

			var exitError = null;
			function handleExit(err) {
				if (err) {
					exitError = err;
				}

				if (processExited && 
					(stdoutClosed || !options.captureStdout) &&
					(stderrClosed || !options.captureStderr)) {
					endCB(exitError, stdout, stderr);
				}
			}

			// Handle process exit
			var processExited = false;
			soxProc.on('exit', function(code, signal) {
				processExited = true;

				if (signal) {
					handleExit(new Error('sox was killed with signal ' + signal));
				} else if (code) {
					handleExit(new Error('sox exited with code ' + code));
				} else {
					handleExit();
				}
			});

			if (options.captureStdout) {
				stdout = '';

				soxProc.stdout.on('data', function(data) {
					stdout += data;
				});

				soxProc.stdout.on('close', function() {
					stdoutClosed = true;
					handleExit();
				});
			}

			if (options.captureStderr) {
				stderr = '';

				soxProc.stderr.on('data', function(data) {
					stderr += data;
				});

				soxProc.stderr.on('close', function() {
					stderrClosed = true;
					handleExit();
				});
			}

			// Call process callback
			processCB(soxProc);
		});
	};

	proto._getArguments = function() {
		var fileOutput = this._outputs.some(function(output) {
			return output.isFile;
		});

		// Global options
		var globalOptions = this._global.get();

		var inputArguments = this._inputs.reduce(function(args, input) {
			// use '-' if source is a stdin stream
			var source;
			var options;

			if (typeof input.source === 'string') {
				source = input.source;
				options = input.options.get();

			} else {
				// The input source is a SoxCommand, so call _getArguments on it
				if (input.isSubCommand) {
					var subCommandArgs = input.source._getArguments();
					source = '|sox ' + subCommandArgs.join(' ');
					options = [];
				}
			}
			
			// For each input, add input options, then '<source>'
			return args.concat(
				options,
				[source]
				);
		}, []);

		// Outputs and output options
		var outputArguments = this._outputs.reduce(function(args, output) {
			var outputArg;
			if (!output.target) {
				outputArg = [];
			} else if (typeof output.target === 'string') {
				outputArg = [output.target];
			} else {
				outputArg = ['-'];
			}

			return args.concat(
				output.options.get(),
				outputArg
				);
		}, []);

		// Effects and effect options
		var effectArguments = this._effects.reduce(function(args, effect) {
			var effectName = [effect.name];
			return args.concat(
				effectName,
				effect.options.get()
				);
		}, []);

		return [].concat(
			globalOptions,
			inputArguments,
			outputArguments,
			effectArguments
			);
	};

	proto._prepare = function(callback, readMetadata) {

		// TODO: Check codecs and formats and other pre-requisites for execution of the command

		var args;
		try {
			args = this._getArguments();
		} catch(e) {
			return callback(e)
		}
		callback(null, args);
	};

	proto.run = function() {
		var self = this;
		var outputPresent = this._outputs.some(function(output) {
			return 'target' in output;
		});

		if (!outputPresent) {
			throw new Error('No output specified');
		}

		var outputStream = this._outputs.filter(function(output) {
			return output.isStream;
		})[0];

		var inputStream = this._inputs.filter(function(input) {
			return input.isStream;
		})[0];

		var ended = false;

		function emitEnd(err, stdout, stderr) {
			if (!ended) {
				ended = true;
				if (err) {
					self.emit('error', err, stdout, stderr);
				} else {
					self.emit('end', stdout, stderr);
				}
			}
		}

		self._prepare(function(err, args) {
			if (err) {
				return emitEnd(err);
			}

			// Run sox command
			var stdout = null;
			var stderr = '';
			self._spawnSox(
				args, 
				{},
				function processCB(soxProc) {
					self.soxProc = soxProc;
					self.emit('start', 'sox ' + args.join(' '));

					// Pipe input stream if any
					if (inputStream) {
						inputStream.source.on('error', function(err) {
							emitEnd(new Error('Input stream error: ' + err.message));
							soxProc.kill();
						});

						inputStream.source.resume();
						inputStream.source.pipe(soxProc.stdin);

						// Set stdin error handler on sox
						soxProc.stdin.on('error', function() {});
					}

					// TODO: Setup timeout if requested

					if (outputStream) {
						// Pipe sox stdout to output stream
						soxProc.stdout.pipe(outputStream.target, outputStream.pipeopts);

						// Handle output stream events
						outputStream.target.on('close', function() {
							setTimeout(function() {
								emitEnd(new Error('Output stream closed'));
								soxProc.kill();
							}, 20);
						});

						outputStream.target.on('error', function(err) {
							emitEnd(new Error('Output stream error: ' + err.message));
							soxProc.kill();
						});

					} else {
						// Gather sox stdout
						stdout = '';
						soxProc.stdout.on('data', function(data) {
							stdout += data;
						});
					}

					soxProc.stderr.on('data', function(data) {
						stderr += data;
					});

				},

				function endCB(err) {
					delete self.soxProc;

					if (err) {
						if (err.message.match(/sox exited with code/)) {
							// Add sox error message
							// err.message += ': ' + utils.
						}
						emitEnd(err, stdout, stderr);
					} else {
						emitEnd(null, stdout, stderr);
					}

				});
		})

	};
};
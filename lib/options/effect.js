'use strict';

var util = require('util');
var utils = require('../utils');

/*
Effect-related methods
*/

module.exports = function(proto) {
	var COMBINE_METHODS = /^(?:concatenate|merge|mix|mix−power|multiply|sequence)$/;

	var ABSOLUTE_TIME_FORMAT = '=%d';
	var TIME_TO_END_FORMAT = '-%d'
	var SAMPLE_FORMAT = '%ds';

	proto.format_time_absolute = function(timeInSeconds) {
		return util.format(ABSOLUTE_TIME_FORMAT, timeInSeconds);
	};

	proto.format_time_relative_to_end = function(timeBeforeEndInSeconds) {
		return util.format(TIME_TO_END_FORMAT, timeBeforeEndInSeconds);
	};

	proto.format_samples = function(sampleNumber) {
		return util.format(SAMPLE_FORMAT, sampleNumber);
	};

	proto.addEffect = function(effectName, options_list) {
		var effect = {
			name: effectName,
			options : utils.args()
		};
		effect.options(options_list);
		this._effects.push(effect);
		return this;
	};

	/* Cuts portions out of the audio. 
		Any number of positions may be given; audio is not sent to the output until the first position is reached. 
		The effect then alternates between copying and discarding audio at each position.
	*/
	proto.trim = function () {
		var positions;
		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			positions = arguments[0];
		} else {
			positions = [].slice.call(arguments);
		}
		return this.addEffect('trim', positions);
	};

	/* Select the input file combining method:
	* concatenate|merge|mix|mix−power|multiply|sequence
	*/
	proto.combine = function (method) {
		if (COMBINE_METHODS.test(method)) {
			return this.addEffect('--combine', method);
		} else {
			throw new Error('Invalid combining method ' + method);
		}
	};

	proto.concat = function () {
		return this.combine('concatenate');
	};

	proto.rateEffect = function () {
		return this;
	};

	proto.removeSilence = function () {
		return this;
	};

	proto.spectrogram = function () {
		return this;
	};

	proto.splice = function () {
		return this;
	};

};
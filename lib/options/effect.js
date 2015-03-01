'use strict';

var util = require('util');
var utils = require('../utils');

/* Effect-related methods */

var COMBINE_METHODS = /^(?:concatenate|merge|mix|mix−power|multiply|sequence)$/;

module.exports = function(proto) {

	/* Add a Sox effect not otherwise implemented below with its name and the
	* ordered list of options for that effect
	*/
	proto.addEffect = function(effectName, optionsList) {
		var effect = {
			name: effectName,
			options : utils.args()
		};
		effect.options(optionsList);
		this._effects.push(effect);
		return this;
	};

	/* Cuts portions out of the audio according to the positions passed in, 
	* either individually or as a list.
	* Ex: trim(0, 5, 17, 32) or trim([0, 5, 17, 32]) or trim('0s', '13s')
	* Any number of positions may be given; audio is not sent to the output 
	* until the first position is reached. The effect then alternates between 
	* copying and discarding audio at each position.
	*/
	proto.trim = function() {
		var positions;
		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			positions = arguments[0];
		} else {
			positions = [].slice.call(arguments);
		}
		return this.addEffect('trim', positions);
	};

	/* Select the input file combining method to be applied to all inputs:
	* concatenate|merge|mix|mix−power|multiply|sequence
	*/
	proto.combine = function(method) {
		if (COMBINE_METHODS.test(method)) {
			return this.addEffect('--combine', method);
		} else {
			throw new Error('Invalid combining method ' + method);
		}
	};

	/* Concatenate all the input audio files in order into one audio file */
	proto.concat = function() {
		return this.combine('concatenate');
	};

	// TODO: implement
	proto.rateEffect = function() {
		return this;
	};

	// TODO: implement
	proto.removeSilence = function() {
		return this;
	};

	// TODO: implement
	proto.spectrogram = function() {
		return this;
	};

	// TODO: implement
	proto.splice = function() {
		return this;
	};

};
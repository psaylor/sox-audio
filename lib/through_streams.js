var data_buffer = new Buffer(70000);
var count_through = 0;
console.log("Data buffer length:", data_buffer.length);
var throughStream = through(
	function write(data) {
		count_through += 1;
		data_counter+= data.length;
		console.log("B", count_through, ": Received through data ", data.length, data);
		var space_left = data_buffer.length - data_index;
		if (space_left < data.length) {
			data.copy(data_buffer, data_index, 0, space_left);
			console.log("Queueing buffer data");
			this.queue(data_buffer);

			data_buffer = new Buffer(data_buffer.length);
			data.copy(data_buffer, 0, space_left, data.length);
			data_index = data.length - space_left;
		} else {
			console.log("Copying directly into buffer");
			data.copy(data_buffer, data_index);
			data_index += data.length;
		}

	},
	function end () {
		console.log("B: End.");
		console.log("B: END: wrote through data ", data_counter);
		this.queue(data_buffer);
		this.queue(null);
	});

var small_buffer = new Buffer(20000);
var throughSmallerPipe = through(
	function write(data) {
		count_through += 1;
		data_counter += data.length;
		console.log("C", count_through, ": Received through data ", data.length);

		var data_to_buffer = data.length;
		var cur_index = 0;

		while (data_to_buffer > 0) {
			console.log("Data left to buffer: ", data_to_buffer);
			var space_left = small_buffer.length - data_index;
			if (space_left < data_to_buffer) {
				console.log("Copying", space_left, "bytes from ", data.length, "data bytes starting at buffer index", data_index, "and data index", cur_index);
				data.copy(small_buffer, data_index, cur_index, cur_index + space_left);
				cur_index += space_left;

				// now small_buffer should be full
				console.log("Queueing small buffer data");
				this.queue(small_buffer);
				data_index = 0;
				small_buffer = new Buffer(small_buffer.length);

				console.log("Copying", data_to_buffer,"bytes directly into small buffer");
				data.copy(small_buffer, data_index, cur_index);
				data_index += data_to_buffer;
				cur_index += data_to_buffer;
			}
			data_to_buffer = data.length - cur_index;
		}
	}, function end() {
		console.log("Small through pipe ended");
		this.queue(small_buffer);
		this.queue(null);
	}
	);

var previousBuffer = null;
var bufferPrevious = through(
	function write(data) {
		console.log("BP Received", data.length, "bytes of data:", data);
		if (previousBuffer !== null) {
			console.log("Queueing previous buffer of ", previousBuffer.length, "bytes:", previousBuffer);
			this.queue(previousBuffer);
		} 
		previousBuffer = data;
	}, function end () {
		console.log("BP ended.");
		if (previousBuffer !== null) {
			console.log("Queueing previous buffer of ", previousBuffer.length, "bytes:", previousBuffer);
			this.queue(previousBuffer);
		}
		this.queue(null);
	}
	);

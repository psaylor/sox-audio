# sox-audio - A NodeJS interface to SoX audio utilities
This Node.js module abstracts the command-line usage of SoX so you can create complex SoX commands and run them with ease. You must have SoX installed in order to use this module.

## Requirements
You must have sox installed in order to use this module, and you must add it to your PATH. [Visit the sox website](http://sox.sourceforge.net/Main/HomePage) to download it.

## Installation
You can install sox-audio through npm:
````
npm install sox-audio
````

## Usage
There are many usage examples in the [examples](./examples) folder, including how to concatenate and trim files, and how to transcode a raw audio stream into a wav audio stream. 

### Creating a SoxCommand
The sox-audio module returns a constructor that you can use to instantiate Sox commands. You can instantiate a SoxCommand with or without the `new` operator.
```js
var SoxCommand = require('sox-audio');
var command = SoxCommand();
```
You may pass an input file name or readable stream, and/or an options object, to the constructor.
```js
var command = SoxCommand('examples/assets/utterance_0.wav');
var command = SoxCommand(fs.createReadStream('examples/assets/utterance_0.wav'));
var command = SoxCommand({option: "value", ... });
```

### Inputs
SoxCommands accept one or any number of inputs. There are 4 different acceptable types of inputs:
* a file name, e.g. `'examples/assets/utterance_0.wav'`
* a readable stream, e.g. `fs.createReadStream('examples/assets/utterance_0.wav')`, however only one input stream may be used per command 
* another SoxCommand, which must set its output to `'-p'` for piping the result of this subcommand as input into the main SoxCommand, and it must provide an outputFileType. You may use more than one input of this type in a command.
* a string for a subcommand to be executed and whose output should be piped as input into the SoxCommand, e.g.`'|sox examples/assets/utterance_0.wav -t wav -p trim 5'`. For this string, follow the format specified in the [SoX documentation](http://sox.sourceforge.net/sox.html#FILENAMES). You may use more than one input of this type in a command.

```js
// Passing an input to the constructor is the same as calling .input()
var command1 = SoxCommand('examples/assets/utterance_0.wav')
  .input('examples/assets/utterance_1.wav')
  .input(fs.createReadStream('examples/assets/utterance_2.wav'));

// A string for a subcommand may be passed as input, following the format '|program [options]'. 
// The program in the subcommand does not have to be sox, it could be any program whose stdout 
// you want to use as an input file.
var command2 = SoxCommand()
  .input('|sox examples/assets/utterance_0.wav -t wav -p trim 5 35');
  
// We can implement the same behavior as command2 using another SoxCommand as a subcommand
var trimSubcommand = SoxCommand()
  .input('examples/assets/utterance_0.wav')
  .outputFileType('wav')
  .output('-p')
  .trim(5, 35);
var command3 = SoxCommand()
  .inputSubCommand(trimSubcommand);
```

#### Input Options
These methods set input-related options on the input that was *most recently added*, so you must add an input before calling these.

* **`inputSampleRate(sampleRate)`** Set the sample rate in Hz (or kHz if appended with a 'k')
* **`inputBits(bitRate)`**  Set the number of bits in each encoded sample
* **`inputEncoding(encoding)`** Set the audio encoding type (sometimes needed with file-types that support more than one encoding, like raw or wav). The main available encoding types are:
  * signed-integer
  * unsigned-integer
  * floating-point
  * for more, see the [sox documentation](http://sox.sourceforge.net/sox.html#OPTIONS) for -e
* **`inputChannels(numChannels)`**  Set the number of audio channels in the audio file
* **`inputFileType(fileType)`** Set the type of the audio file

```js
var command = SoxCommand();
command.input(inputStream)
  .inputSampleRate(44100)
  .inputEncoding('signed')
  .inputBits(16)
  .inputChannels(1)
  .inputFileType('raw');
```

### Outputs
SoxCommands accept one or any number of outputs. There are 3 different acceptable types of outputs:
* a file name, e.g. `'examples/outputs/utterance_0.wav'`
* a writable stream, e.g. `fs.createWriteStream('examples/outputs/utterance_0.wav')`, however only one output stream may be used per command 
* the string `'-p'` or `'--sox-pipe'`, this can be used in place of an output filename to specify that the Sox command should be used as an input pipe into another Sox command. You may refer to the [sox documentation](http://sox.sourceforge.net/sox.html#FILENAMES) for -p

#### Output Options
These methods set output-related options on the output that was *most recently added*, so you must add an output before calling these.

* **`outputSampleRate(sampleRate)`** Set the sample rate in Hz (or kHz if appended with a 'k')
* **`outputBits(bitRate)`**  Set the number of bits in each encoded sample
* **`outputEncoding(encoding)`** Set the audio encoding type (sometimes needed with file-types that support more than one encoding, like raw or wav). The main available encoding types are:
  * signed-integer
  * unsigned-integer
  * floating-point
  * for more, see the [sox documentation](http://sox.sourceforge.net/sox.html#OPTIONS) for -e
* **`outputChannels(numChannels)`**  Set the number of audio channels in the audio file
* **`outputFileType(fileType)`** Set the type of the audio file to output, particularly important when the output is a stream

```js
var command = SoxCommand();
command.input(inputStream)
  .inputSampleRate(44100)
  .inputEncoding('signed')
  .inputBits(16)
  .inputChannels(1)
  .inputFileType('raw');
  
command.output(outputStream)
  .outputSampleRate(1600)
  .outputEncoding('signed')
  .outputBits(16)
  .outputChannels(1)
  .outputFileType('wav');
```

### Effects
SoX can be used to invoke a number of audio 'effects', which should be provided at the end of the command. Multiple effects may be applied by specifying them one after another. You can [learn about all of the effects available to SoX here](http://sox.sourceforge.net/sox.html#EFFECTS). SoxCommand currently providers helpers for some popular effects, and a catch-all method to apply any of the other effects.

#### `trim(position(+))` 
Cuts portions out of the audio. Any number of _positions_ may be given, either individually or as a list, and each _position_ can be a number or formatted string. Once the first _position_ is reached, the effect alternates between copying and discarding the audio at each _position_. Using 0 for the first _position_ allows copying from the beginning of the audio. The format for a _position_ can be:
  * `5.2` a number indicating 5.2 seconds from the previous _position_ or the start of the audio if there was no previous
  * `'15:25.30'` a string indicating 15 minutes, 25 seconds, and 30 milliseconds from the previous _position_ or the start of the audio file
  * `'=2:05'` a string indicating 2 minutes and 5 seconds into the audio file, relative to the start of the audio
  * `'-3:30'` a string indicating 3 minutes and 30 seconds before the end of the audio file
  * `'=1250s'` a string indicate 1250 samples into the audio file
  
#### `combine(method)`
Select the input file combining method, which can be one of the following strings:
  * `'concatenate'`
  * `'sequence'`
  * `'mix'`
  * `'mix-power'`
  * `'merge'`
  * `'multiply'`
  
#### `concat()`
A shorthand for applying the concatenate combining method. The audio from each input will be concatenated in the order added to the command to form the output file. The input files must have the same number of channels.

#### `addEffect(effectName, effectOptionsList)`
A catch-all method allowing you to apply any SoX effect. Apply the SoX effect with `effectName` using the command line options provided in `effectOptionsList`. Please [refer to the SoX documentation on all available effects and their usages](http://sox.sourceforge.net/sox.html#EFFECTS).

### Running a SoxCommand
Starting the SoxCommand is as easy as 
```js
command.run();
```
Of course, you need to fully specify the command first, with inputs, outputs, and optional effects. You can also set listeners on your command for `prepare`, `start`, `progress`, `error`, and `end` events.
```js
var command = SoxCommand()
  .input(...)
  .output(...)
  .addEffect(..., [...]);
  
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

command.run();
```

### Selected Examples
The following example concatenates three audio files while trimming off the first 5 seconds of the first file, and the last 10 seconds of the last file through subcommands.
```js
var SoxCommand = require('sox-audio');
var TimeFormat = SoxCommand.TimeFormat;

var command = SoxCommand();

var startTimeFormatted = TimeFormat.formatTimeAbsolute(5);
var endTimeFormatted = TimeFormat.formatTimeRelativeToEnd(10);

var trimFirstFileSubCommand = SoxCommand()
	.input('./assets/utterance_0.wav')
	.output('-p')
	.outputFileType('wav')
	.trim(startTimeFormatted);

var trimLastFileSubCommand = SoxCommand()
	.input('./assets/utterance_2.wav')
	.output('-p')
	.outputFileType('wav')
	.trim(0, endTimeFormatted);

command.inputSubCommand(trimFirstFileSubCommand)
  .input('./assets/utterance_1.wav');
  .inputSubCommand(trimLastFileSubCommand)
	.output(outputFileName)
	.concat();

command.run();
```

In this example, a 44.1 kHz raw audio stream is converted on the fly to a 16 kHz wav audio stream.
```js
var command = SoxCommand();
command.input(inputStream)
	.inputSampleRate('44.1k')
	.inputEncoding('signed')
	.inputBits(16)
	.inputChannels(1)
	.inputFileType('raw')
	.output(outputPipe)
	.outputFileType('wav')
	.outputSampleRate('16k');

command.run();
```

## Development
Check out this repo, make your changes, commit the code and then publish a new release on npm:
```
$ cd sox-audio
$ npm publish
+ sox-audio@<new-version-number>
```
* https://gist.github.com/coolaj86/1318304
* https://quickleft.com/blog/creating-and-publishing-a-node-js-module/

## License
This code is under the MIT License. 

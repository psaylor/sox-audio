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
````
var SoxCommand = require('sox-audio');
var command = SoxCommand();
````
You may pass an input file name or readable stream, and/or an options object, to the constructor.
````
var command = SoxCommand('examples/assets/utterance_0.wav');
var command = SoxCommand(fs.createReadStream('examples/assets/utterance_0.wav'));
var command = SoxCommand({option: "value", ... });
````

### Inputs
SoxCommands accept one or any number of inputs. There are 4 different acceptable types of inputs:
* a file name, e.g. `'examples/assets/utterance_0.wav'`
* a readable stream, e.g. `fs.createReadStream('examples/assets/utterance_0.wav')`, however only one input stream may be used per command 
* another SoxCommand, which must set its output to `'-p'` for piping the result of this subcommand as input into the main SoxCommand, and it must provide an outputFileType. You may use more than one input of this type in a command.
* a string for a subcommand to be executed and whose output should be piped as input into the SoxCommand, e.g.`'|sox examples/assets/utterance_0.wav -t wav -p trim 5'`. For this string, follow the format specified in the [SoX documentation](http://sox.sourceforge.net/sox.html#FILENAMES). You may use more than one input of this type in a command.

````
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
````

#### Input Options
These methods set input-related options on the input that was *most recently added*, so you must add an input before calling these.

* inputSampleRate(sampleRate)
* inputBits(bitRate)
* inputEncoding(encoding)
* inputChannels(numChannels)
* inputFileType(fileType)


### Outputs

#### Output Options


### Effects

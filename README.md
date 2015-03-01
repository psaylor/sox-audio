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

#### Inputs

#### Outputs


#### Effects

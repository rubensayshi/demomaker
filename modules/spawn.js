/**
 * This is a wrapper module around the native child_process.spawn method
 * it provides us with a shorter syntax and some default error and exit handling
 * 
 * it exports just the spawn() method so you can:
 * 	var spawn = require('./modules/spawn');
 *  spawn('ls', ['-l', '-a']);
 */

// required modules
var	child_process	= require('child_process');

// the new spawn method
var spawn = function(_cmd, _args, _fn, _errorFn, _exitFn) {
	var cmd;
	var args;
	var fn;
	var errorFn;
	var exitFn;

	var process;

	var init = function(_cmd, _args, _fn, _errorFn, _exitFn) {
		cmd		= _cmd;
		args	= _args 	|| [];
		fn		= (_fn		? _fn		: defaultFn);
		errorFn	= (_errorFn ? _errorFn 	: defaultErrorFn);
		exitFn	= (_exitFn	? _exitFn	: defaultExitFn);

		spawn();

		return {};
	};

	var spawn = function() {
		process = child_process.spawn(cmd, args);

		process.stdout	.on('data', fn);
		process.stderr	.on('data', errorFn);
		process			.on('exit', exitFn);	
	};

	var defaultFn = function(data) {
		  console.log('STDOUT >> `'+cmd+' '+args.join(' ')+'` >> '+data);
	};

	var defaultErrorFn = function(data) {
		console.log('STDERR >> `'+cmd+' '+args.join(' ')+'` >> '+data);
	};

	var defaultExitFn = function(code) {
		if(code) {
			console.log('EXIT >> `'+cmd+' '+args.join(' ')+'` >> '+code);
		}
	};

	return init(_cmd, _args, _fn, _errorFn, _exitFn);
};

// export our method
exports = module.exports = spawn;

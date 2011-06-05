var	spawn 	= require('./modules/spawn'),
	fs		= require('fs'),
	path	= require('path'),
	async	= require('async');

/*
 * define usage() function
 */
function usage(msg) {
	if(msg)
		console.log(msg);
	
	console.log('this is how you do it ...');
	
	process.exit();
}

/*
 * find out who and where we are
 */
var me 		= process.argv[1],	
	root	= path.dirname(me);

/*
 * set default CLI args
 */
var force	= false,
	debug	= false,
	target	= null;

/*
 * handle CLI args
 */
process.argv.splice(2).forEach(function (arg) {
	switch (arg) {
		// debug
		case '--help':
		case '-h':
			usage();
		break;
	
		// force
		case '--force':
		case '-f':
			force	= true;
		break;
		
		// debug
		case '-d':
			debug	= true;
		break;
	
		default:
			if(target) {
				usage('wtf we already know the target? you told me it was ['+target+'] and now also ['+arg+']?');
			}
		
			target = arg;
		break;
	}
});

if(!target) {
	usage('no target dewd ...');
}

var giturl		= 'git@github.com:rubensayshi/node-timerime-reloaded.git',
	targetdir	= root + '/targets/' + target;

console.log('STATUS >> init target for ['+target+'] in ['+root+'/targets]'+(force ? ' with force' : ''));

async.waterfall([
	/**
	 * check if the targetdir doesn't already exists
	 * with --force we'll just destroy the current install
	 * otherwise we throw an error
	 */
	function (callback) {
		path.exists(targetdir, function(exists) {
			if (exists) {
				if (force) {
					spawn('rm', ['-rf', targetdir], null, null, function(code) {
						if (code) {
							callback(new Error('failed to rm -rf targetdir: '+code));
						} else {
							callback();
						}	
					});
				} else {
					callback(new Error('target already created .. go away !'));
				}
			} else {
				callback();
			}
		});
	},
	/**
	 * create the fresh directory
	 */
	function (callback) {
		fs.mkdir(targetdir, 0770, function(error) { 
			if (error) {
				callback(new Error('failed to create dir ['+targetdir+'] .. '));
			}
			
			console.log('STATUS >> dir created ['+targetdir+']');
			callback();
		});
	},
	/**
	 * clone the git repo in the fresh directory
	 */
	function (callback) {
		spawn('git', ['clone', giturl, targetdir], null, null, function(code) {
			if (code) {
				callback(new Error('failed to git clone: '+code));
			} else {
				callback();
			}
		});
	},
	/**
	 * initialize the project with the correct settings
	 */
	function (callback) {
		callback();
	},
	/**
	 * get vendors
	 */
	function (callback) {
		spawn(targetdir + '/bin/node_modules', [], null, null, function(code) {
			if (code) {
				callback(new Error('failed to get vendors: '+code));
			} else {
				callback();
			}
		});
	},
	/**
	 * load fixtures
	 */
	function (callback) {
		spawn('node', [targetdir + '/tools/testdata.js', '-s'], null, null, function(code) {
			if (code) {
				callback(new Error('failed to load fixtures: '+code));
			} else {
				callback();
			}
		});
	}
], 
/**
 * finish with handling error or success message
 */
function (error) {
	if (error) {
		console.log('ERROR >> '+error.message);
	}
	
	console.log('STATUS >> done?!');
});

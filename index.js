/*********************************************************
* index.js - Main Wrapper
**********************************************************
* This file is for connecting everything to Discord via
* discord.js. All modules will interface with code in
* this file. 
* No functionality will be defined in this file.
*/

const fs = require("fs");

var modulePaths = [
	/* priority with 0 being highest priority
	["modules/core/commands.js"],
	["modules/general/commands.js"]
	*/
]

var moduleDirs = fs.readdirSync("modules/");
for(var i = 0; i < moduleDirs.length; i++){
	var modFiles = fs.readdirSync("modules/" + moduleDirs[i].toString() + "/")
	// get metadata from module js exports
	// set priorities
}

// load modules in correct order
// register everything from modules

const Discord = require('discord.js');
const client = new Discord.Client();


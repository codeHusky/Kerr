/*********************************************************
* index.js - Main Wrapper
**********************************************************
* This file is for connecting everything to Discord via
* discord.js. All modules will interface with code in
* this file. 
* No functionality will be defined in this file.
*/
const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require("fs");

var globalConfig = require('./config.js');

function currentTime() {
    var date = new Date();
    var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
}
const mlogger = {
	info: function(m, txt){
		console.log("[" + currentTime() + "] ["+m+"] [INFO] " + txt);
	},
	warn: function(m, txt){
		console.log("[" + currentTime() + "] ["+m+"] [WARN] " + txt);
	},
	error: function(m, txt){
		console.log("[" + currentTime() + "] ["+m+"] [ERROR] " + txt);
	}
}

const logger = {
	info:function(txt){
		mlogger.info("Wrapper",txt);
	},
	warn:function(txt){
		mlogger.warn("Wrapper",txt);
	},
	error:function(txt){
		mlogger.error("Wrapper",txt);
	},
}

var modules = {};
var moduleInitSequence = [];

var moduleDirs = fs.readdirSync("modules/");
for(var i = 0; i < moduleDirs.length; i++){
	var modFiles = fs.readdirSync("modules/" + moduleDirs[i].toString() + "/")
	for(var j = 0; j < modFiles.length; j++){
		var proto = require("./modules/" + moduleDirs[i].toString() + "/" + modFiles[j].toString());
		if(proto.hasOwnProperty("_metadata")){
			var id = moduleDirs[i] + "/" + modFiles[j].toString().replace(".js","");
			logger.info("loading " + id)
			proto.id = id;
			modules[id] = proto;
			if(proto._metadata.hasInit){
				var pri = proto._metadata.priority;
				if(moduleInitSequence[pri]){
					moduleInitSequence[pri].push(id);
				}else{
					moduleInitSequence[pri] = [id];
				}
			}
		}else{
			logger.warn("invalid module: " + moduleDirs[i] + "/" + modFiles[j].toString())
		}
	}
}

var commandRegister = {};

function getContext(guildConfig, msg, selfMod) {
	return {
		msg:msg,
		Discord:Discord,
		client: client,
		commandRegister: commandRegister,
		logger: mlogger,
		modules: modules,
		guildConfig: guildConfig,
		globalConfig: globalConfig
	}
}


for(var i in modules){
	var m = modules[i];
	if(m._metadata.features.indexOf("commands") > -1){
		//Register commands
		for(var c = 0; c < m.commands.length; c++){
			/*
				{
					aliases: ["help"],
					helpSyntax: "help",
					description: "Provides information about Kerr's commands.",
					callback: function(ctx){
						var client = ctx.client;
						var commands = ctx.commandRegister.getCommands();
						ctx.logger.info("Core/Commands","Help called")
					}
				}
			*/
			var cmd = m.commands[c];
			commandRegister[cmd.aliases[0]] = {
				aliases:cmd.aliases,
				originModule: i,
				helpSyntax: cmd.helpSyntax,
				description: cmd.description,
				callback: cmd.callback
			};
			for(var a = 1; a < cmd.aliases.length; a++){
				commandRegister[cmd.aliases[a]] = cmd.aliases[0];
			}
		}
	}
}
for(var i = 0; i < moduleInitSequence.length; i++){
	if(moduleInitSequence[i]){
		for(var j = 0; j < moduleInitSequence[i].length; j++){
			var mod = modules[moduleInitSequence[i][j]];
			mod.ready = false;
			mod.init(getContext(null,null,mod));
		}
	}
}

// load modules in correct order
// register everything from modules






client.on('ready', function() {
	logger.info("Logged in as " + client.user.tag + ".");
	client.guilds.forEach(function (guild, key){
		modules["core/configuration"].getConfig(
			getContext(null,null,modules["core/configuration"]),
			guild.id,
			function(conf) {
				if(conf == false){
					logger.error("Failed to prepare guild with id " + guild.id);
				}
			});
	})

	setTimeout(function() {
		modules["core/configuration"].getConfig(
			getContext(null,null,modules["core/configuration"]),
			"539901134995718155",
			function(conf) {
				logger.info("GUILD CONF:")
				logger.info(JSON.stringify(conf));
			});
	},10000);
})

client.on('message', function(msg) {
	if(msg.channel.type == "text" && !msg.author.bot){
		var guildConfig = modules["core/configuration"].getConfig();
		if(msg.content.indexOf(guildConfig.prefix) == 0){
			var cmd = msg.content.split(" ")[0].substring(guildConfig.prefix.length).toLowerCase();
			if(cmd.length == 0) return;
			if(commandRegister.hasOwnProperty(cmd)){
				var command = commandRegister[cmd];
				if(typeof command == "string"){
					command = commandRegister[command];
				}
				command.callback(getContext(guildConfig, msg, modules[command.originModule]));
			}
		}
	}
})
var clientCheck = setInterval(function() {
	for(var i in modules){
		if(modules[i].hasOwnProperty("ready") && !modules[i].ready){
			return;
		}
	}
	clearInterval(clientCheck);
	logger.info("All modules ready, logging in...");
	client.login(require("./token.js").token);
},100);

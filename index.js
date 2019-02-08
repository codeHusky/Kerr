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
//console.log(JSON.stringify(globalConfig,null,2));
function currentTime() {
    var date = new Date();
    var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
}

function getLogFileName() {
    var date = new Date();
    var fDate = (date.getMonth()+1) + "-" + date.getDate() + "-" + date.getFullYear();
   	var filePrefix = "logs " + fDate + " ";
    var logNum = 0;

    var lastCheckExisted = true;
    while(lastCheckExisted){
    	logNum++;
    	lastCheckExisted = fs.existsSync("./logs/" + filePrefix + logNum + ".log");
    }
    return filePrefix + logNum + ".log";
}
try{
	fs.mkdirSync("./logs/");
}catch(e){}
const logFileName = getLogFileName();
const mlogger = {
	info: function(m, txt){
		var fTxt = "[" + currentTime() + "] ["+m+"] [INFO] " + txt;
		console.log(fTxt);
		fs.writeFileSync('./logs/' + logFileName, fTxt + "\n",{flag:"a"});
	},
	warn: function(m, txt){
		var fTxt = "[" + currentTime() + "] ["+m+"] [WARN] " + txt;
		console.log(colors.yellow(fTxt));
		fs.writeFileSync('./logs/' + logFileName, fTxt + "\n",{flag:"a"});
	},
	error: function(m, txt){
		var fTxt = "[" + currentTime() + "] ["+m+"] [ERROR] " + txt;
		console.log(colors.red(fTxt));
		fs.writeFileSync('./logs/' + logFileName, fTxt + "\n",{flag:"a"});
	}
}
const colors = require('colors/safe');
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
function scheduleDeletion(msg, time){
	setTimeout(function() {
		msg.delete();
	},time);
}


var commandRegister = {};

function getContext(guildConfig, msg) {
	return {
		msg:msg,
		Discord:Discord,
		client: client,
		commandRegister: commandRegister,
		logger: mlogger,
		modules: modules,
		guildConfig: guildConfig,
		globalConfig: globalConfig,
		scheduleDeletion: scheduleDeletion
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




function setActivity() {
	client.user.setActivity('over rigby.space', { type: 'WATCHING' })
	  .then(presence => {})
	  .catch(console.error);
}

client.on('ready', function() {
	logger.info("Logged in as " + client.user.tag + ".");
	setActivity()
	var guilds = [];
	client.guilds.forEach(function (guild, key){
		guilds.push(guild.name);
		modules["core/configuration"].getConfig(
			getContext(null,null,modules["core/configuration"]),
			guild.id,
			function(conf) {
				if(conf == false){
					logger.error("Failed to prepare guild with id " + guild.id);
				}
			});
	})
	logger.info("Guilds: " + guilds.join(", "));

})

client.on('guildCreate', function(guild){
	modules["core/configuration"].getConfig(
		getContext(null,null,modules["core/configuration"]),
		guild.id,
		function(conf) {
			if(conf == false){
				logger.error("Failed to prepare guild with id " + guild.id);
			}else{
				logger.info("Joined " + guild.name);
			}
		});

})

client.on('message', function(msg) {
	if(msg.author.id == client.user.id) return;
	if(msg.channel.type == "text" && msg.guild && !msg.author.bot){
		modules["core/configuration"].getConfig(getContext(null,msg), msg.guild.id, function(conf){
			if(conf != false){
				const guildConfig = conf;
				if(msg.content.indexOf(guildConfig.prefix) == 0){
					var cmd = msg.content.split(" ")[0].substring(guildConfig.prefix.length).toLowerCase();
					if(cmd.length == 0) return;
					if(commandRegister.hasOwnProperty(cmd)){
						var command = commandRegister[cmd];
						if(typeof command == "string"){
							command = commandRegister[command];
						}
						var oM = command.originModule.split("/");
						if(guildConfig.modules[oM[0]]){
							if(guildConfig.modules[oM[0]][oM[1]] == false){
								msg.channel.send("<@" + msg.author.id + ">, this command is disabled.").then(message => {
									scheduleDeletion(message,3000);
									scheduleDeletion(msg,3000);
								});
								return;
							}
						}
						for(var i = 0; i < command.aliases.length; i++){
							if(guildConfig.commandBlacklist.indexOf(command.aliases[i]) > -1){
								msg.channel.send("<@" + msg.author.id + ">, this command is disabled.").then(message => {
									scheduleDeletion(message,3000);
									scheduleDeletion(msg,3000);
								});
								return;
							}
						}
						command.callback(getContext(guildConfig, msg, modules[command.originModule]),msg.content.replace(/  +/," ").substring(msg.content.replace(/  +/," ").indexOf(cmd) + cmd.length + 1));
					}
				}else{
					if(msg.content.toLowerCase().indexOf("<@!" + client.user.id + "> prefix") == 0){
						msg.delete();
						msg.author.send("The command prefix for **" + msg.guild.name + "** is `" + conf.prefix + "`.")
					}
				}
			}else{
				logger.error("Failed to retrieve guild config.");
			}
		});
		
	}else{
		if(msg.channel.type == "dm"){
			msg.channel.send("Hi there! If you'd like to know my prefix for a given server you're in, please ping me there like this: `@Kerr prefix`\nThank you!")
		}
	}
})

client.on('error', (err) => {
	logger.error("Discord.js exception occured.");
	logger.error(JSON.stringify(err.error));
});

client.on('reconnecting', function() {
	logger.info("Reconnecting to Discord...");
});

client.on('resume', function() {
	logger.info("Connection resumed.");
	setActivity()
})

/**
*	Module-related event handlers.
*/

function getModulesForEvent(event){
	var mods = [];
	for(var i in modules){
		if(modules[i]._metadata.features.indexOf("events")>-1){
			if(modules[i].events.hasOwnProperty(event)){
				mods.push(i);
			}
		}
	}
	return mods;
}

function isModuleEnabled(m, guildID, callback){
	modules["core/configuration"].getConfig(getContext(), guildID, function(conf){
		if(conf == false){
			callback(false);
		}else{
			callback(conf.modules[m.split("/")[0]][m.split("/")[1]]);
		}
	});
}

client.on('messageReactionAdd', function(mR, user){
	var mods = getModulesForEvent('messageReactionAdd');
	mods.forEach(modID => {
		if(mR.message.guild){
			isModuleEnabled(modID, mR.message.guild.id, function(isIt){
				if(isIt){
					modules[modID].events.messageReactionAdd(getContext(),mR,user);
				}
			})
		}else{
			modules[modID].events.messageReactionAdd(getContext(),mR,user);
		}
	})
})
client.on('messageReactionRemove', function(mR, user){
	var mods = getModulesForEvent('messageReactionRemove');
	mods.forEach(modID => {
		if(mR.message.guild){
			isModuleEnabled(modID, mR.message.guild.id, function(isIt){
				if(isIt){
					modules[modID].events.messageReactionRemove(getContext(),mR,user);
				}
			})
		}else{
			modules[modID].events.messageReactionRemove(getContext(),mR,user);
		}
	})
})
client.on('messageReactionRemoveAll', function(message){
	var mods = getModulesForEvent('messageReactionRemoveAll');
	mods.forEach(modID => {
		if(message.guild){
			isModuleEnabled(modID, message.guild.id, function(isIt){
				if(isIt){
					modules[modID].events.messageReactionRemoveAll(getContext(),message);
				}
			})
		}else{
			modules[modID].events.messageReactionRemoveAll(getContext(),message);
		}
	})
})

client.on('messageUpdate', function(oldMessage, newMessage){
	var mods = getModulesForEvent('messageUpdate');
	mods.forEach(modID => {
		if(newMessage.guild){
			isModuleEnabled(modID, newMessage.guild.id, function(isIt){
				if(isIt){
					modules[modID].events.messageUpdate(getContext(),oldMessage, newMessage);
				}
			})
		}else{
			modules[modID].events.messageUpdate(getContext(),oldMessage, newMessage);
		}
	})
})

/*const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
	MESSAGE_REACTION_REMOVE_ALL: 'messageReactionRemoveAll'
};

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;
	const { d: data } = event;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();

	if (channel.messages.has(data.message_id)) return;
	const message = await channel.fetchMessage(data.message_id);
	if(data.emoji){
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		var reaction = message.reactions.get(emojiKey);
		if (!reaction) {
			// Create an object that can be passed through the event like normal
			const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
			reaction = new Discord.MessageReaction(message, emoji, 0, data.user_id === client.user.id);
		}
		client.emit(events[event.t], reaction, user);
	}else{
		client.emit(events[event.t], message);
	}
});*/

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


process.on('uncaughtException', (err) => {
	logger.error("A fatal exception has occured. ");
	logger.error(err.stack);
	logger.error("The bot will now shut down.")
	process.exit(1);
  	//fs.writeSync(1, `Caught exception: ${err}\n`);
});

process.on('unhandledRejection', (reason, p) => {
	logger.warn('Unhandled Rejection! '+ reason.stack);
});
/**************************************
* core/database
***************************************
* This module is for server-specific
* configuration. This is not the bot's
* configuration, but rather for 
* controlling the enabling, disabling
* or general configuration of specific
* modules for certain servers.
*/
module.exports = {
	_metadata:{
		core:true,
		hasInit:false,
		features:["commands"]
	},
	defaultGuildConfig:require('../../config.js').defaultGuildConfig,
	getConfig: function(ctx,guildID, callback){

		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/configuration"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/configuration"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/configuration"].id,txt);
			}
		}
		const db = ctx.modules["core/database"];
		db.getData(ctx,"guildConfigs",{guildID:guildID},function (result) {
			if(result == false){
				ctx.modules["core/configuration"].initConfig(ctx,guildID,function(success){
					if(success != false){
						callback(success);
					}else{
						callback(false);
					}
				});
			}else{
				callback(result);
			}
		})
		
	},
	initConfig: function(ctx,guildID, callback){
		var doc = ctx.modules["core/configuration"].defaultGuildConfig;
		doc.guildID = guildID;
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/configuration"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/configuration"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/configuration"].id,txt);
			}
		}
		const db = ctx.modules["core/database"];
		db.insertData(ctx,"guildConfigs",doc,function (result) {
			if(result == false){
				logger.error("Failed to init config for guild.");
				callback(false);
			}else{
				callback(result);
			}
		});
	},
	updateConfig: function(ctx,guildID, config, callback){
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/configuration"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/configuration"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/configuration"].id,txt);
			}
		}
		const db = ctx.modules["core/database"];
		db.updateData(ctx,"guildConfigs",{where:{guildID:guildID},set:config},function (result) {
			if(result == false){
				logger.error("Failed to update config for guild.");
				callback(false);
			}else{
				callback(result);
			}
		});
	},
	commands:[
		{
			aliases:["set"],
			helpSyntax: "set <node> <value>",
			description: "Set a guild-specific configuration value (hirarchy denoted with `.`)",
			callback: function(ctx, params){
				if(ctx.msg.member.hasPermission("MANAGE_GUILD")){
					params = params.split(" ");
					if(params.length != 2){
						ctx.msg.channel.send("Invalid parameters. Only accepts 2 parameters.");
						return;
					}
				}else{
					ctx.msg.send("<@" + ctx.msg.author.id + ">, you do not have permission to run this command.").then(message => {
						scheduleDeletion(message,3000);
						scheduleDeletion(ctx.msg, 3000);
					})
				}

			}
		}
	]
}
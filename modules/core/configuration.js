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
					ctx.modules["core/configuration"].getConfig(ctx, ctx.msg.guild.id, function(result){
						if(result == false){
							ctx.msg.channel.send("An error occured while fetching your guild's configuration. No changes were made.");
						}else{
							var depth = result;
							var path = params[0].split(".");
							if(path[0] == "guildID" || path[0] == "_id"){
								ctx.msg.channel.send("Invalid path! Failure at `" + path[0] + "`!");
								return;
							}
							for(var i = 0; i < path.length-1/* We want to leave the last element for direct editing. */; i++){
								if(depth.hasOwnProperty(path[i])){
									depth = depth[path[i]];
								}else{
									ctx.msg.channel.send("Invalid path! Failure at `" + path[i] + "`!");
									return;
								}
							}
							var originalType = typeof depth[path[path.length-1]];
							if(originalType == "object"){
								ctx.msg.channel.send("Invalid path! Must be more specific.");
							}else{
								
								try{
									depth[path[path.length-1]] = JSON.parse(params[1]);
								}catch(e){
									depth[path[path.length-1]] = params[1];
								}
								ctx.modules["core/configuration"].updateConfig(ctx, ctx.msg.guild.id, result, function(result){
									if(result == false){
										ctx.msg.channel.send("An error occured while updating your guild's configuration.");
									}else{
										ctx.msg.channel.send("Change made successfully.");
									}
								});
							}
						}
					})

				}else{
					ctx.msg.send("<@" + ctx.msg.author.id + ">, you do not have permission to run this command.").then(message => {
						scheduleDeletion(message,3000);
						scheduleDeletion(ctx.msg, 3000);
					})
				}

			}
		},
		{
			aliases:["get"],
			helpSyntax: "get [node]",
			description: "Get a guild-specific configuration/configuration value (hirarchy denoted with `.`)",
			callback: function(ctx, params){
				if(ctx.msg.member.hasPermission("MANAGE_GUILD")){
					if(params.length == 0){
						params = [];
					}else{
						params = params.split(" ");
					}
					ctx.modules["core/configuration"].getConfig(ctx, ctx.msg.guild.id, function(result){
						if(result == false){
							ctx.msg.channel.send("An error occured while fetching your guild's configuration. No changes were made.");
						}else{
							if(params.length > 0){
								var depth = result;
								var path = params[0].split(".");
								for(var i = 0; i < path.length-1/* We want to leave the last element for direct editing. */; i++){
									if(depth.hasOwnProperty(path[i])){
										depth = depth[path[i]];
									}else{
										ctx.msg.channel.send("Invalid path! Failure at `" + path[i] + "`!");
										return;
									}
								}
								ctx.msg.channel.send("```json\n" + JSON.stringify(depth[path[path.length-1]],null,2) + "\n```");
							}else{
								delete result._id;
								delete result.guildID;
								ctx.msg.channel.send("```json\n" + JSON.stringify(result,null,2) + "\n```");
							}
						}
					})

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
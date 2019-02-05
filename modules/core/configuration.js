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

	},
	commands:[]
}
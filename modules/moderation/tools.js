module.exports = {
	_metadata:{
		core:false,
		hasInit:false,
		features:["commands"],
		defaults: {
			enabled: true,
			settings: {
				minReasonLength:10,
				muteRole:""
			}
		}
	},
	commands:[
		{
			aliases:["purge"],
			helpSyntax: "purge [amount]",
			description: "Purge an amount of messages. You can only purge up to 100 messages at a given time, including your own.",
			callback: function(ctx, params){
				if(ctx.msg.member.hasPermission("MANAGE_MESSAGES")){
					const logger = {
						info:function(txt){
							ctx.logger.info(ctx.modules["general/starboard"].id,txt);
						},
						warn:function(txt){
							ctx.logger.warn(ctx.modules["general/starboard"].id,txt);
						},
						error:function(txt){
							ctx.logger.error(ctx.modules["general/starboard"].id,txt);
						}
					}
					var num = params.split(" ")[0];
					if(isNaN(parseFloat(num))){
						ctx.msg.delete();
						ctx.msg.author.send("You must specifiy a valid number to purge.");
					}
					ctx.msg.channel.fetchMessages({
						limit: Math.min(100,(parseFloat(num) + 1))
					}).then(messages=>{
						messages.forEach(msg => {
							msg.delete();
						})
					}).catch(err => {
						logger.error(err.stack);
						ctx.msg.delete();
						ctx.msg.author.send("An error occured while purging messages.");
					})
				}else{
					ctx.msg.channel.send("<@" + ctx.msg.author.id + ">, you do not have permission to run this command.").then(message => {
						ctx.scheduleDeletion(message,3000);
						ctx.scheduleDeletion(ctx.msg, 3000);
					})
				}
			}
		}
	]
};
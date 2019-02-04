module.exports = {
	_metadata:{
		core:true,
		priority:0,
		features:["commands"]
	},
	commands: [
		{
			aliases: ["help"],
			helpSyntax: "help",
			description: "Provides information about Kerr's commands.",
			callback: function(ctx){
				var client = ctx.client;
				var commands = ctx.commandRegister;
				ctx.logger.info(ctx.selfMod.id,"Help called")
				ctx.msg.channel.send("<@" + ctx.msg.author.id + ">, check your DMs for help.")
			}
		}
	]
}
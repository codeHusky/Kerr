module.exports = {
	_metadata:{
		core:true,
		hasInit:false,
		features:["commands"]
	},
	commands: [
		{
			aliases: ["help"],
			helpSyntax: "help",
			description: "Provides information about Kerr's commands.",
			callback: function(ctx){
				//var client = ctx.client;
				var commands = ctx.commandRegister;
				ctx.msg.channel.send("<@" + ctx.msg.author.id + ">, check your DMs for help.")
					.then(message => {
						ctx.scheduleDeletion(message,3000);
						ctx.scheduleDeletion(ctx.msg, 3000);
					})
				var embed = new ctx.Discord.RichEmbed({
						color:0xf45f42
				});
				var moduleCategories = [];
				for(var i in ctx.modules){
					var modCate = i.split("/")[0];
					if(moduleCategories.indexOf(modCate) == -1){
						moduleCategories.push(modCate);
					}
				}
				embed.setAuthor("Kerr - " + ctx.msg.guild.name, ctx.client.user.avatarURL);
				embed.setDescription("Below is a list of commands.");

				for(var i = 0; i < moduleCategories.length; i++){
					var category = moduleCategories[i];
					var pCate = category[0].toUpperCase() + category.substring(1);

					var cmdPrintable = "";
					for(var j in commands){
						var cmd = commands[j];
						
						if(typeof cmd == "object"){
							if(cmd.originModule.indexOf(category) != 0){
								continue;
							}
							var aliases = "";
							if(cmd.aliases.length > 1){
								for(var k = 1; k < cmd.aliases.length; k++){
									aliases += ctx.guildConfig.prefix + cmd.aliases[k] + ", ";
								}
							}
							cmdPrintable += "**" + ctx.guildConfig.prefix + cmd.helpSyntax + "** " + ((aliases.length > 0)?"*("+aliases.substring(0,aliases.length-2)+")*":"") + " \n" + cmd.description + "\n\n" 
						}
					}
					if(cmdPrintable.length > 0){
						embed.addField(pCate,cmdPrintable,false);
					}
				}
				ctx.msg.author.send(embed);
				//ctx.msg.channel.send(embed);
			
			}
		},
		{
			aliases:["info","about"],
			helpSyntax: "info",
			description: "Provides information about Kerr itself.",
			callback: function(ctx){
				var embed = new ctx.Discord.RichEmbed({
						color:0xf45f42
				});
				embed.setDescription("Kerr is a multi-function Discord bot inspired by several other bots, as well as Rigby.");
				embed.setAuthor("Kerr - A Discord Bot", ctx.client.user.avatarURL);
				embed.addField("Author","Loki#0069",true);
				embed.addField("Version","1.0.0",true);
				embed.addField("Sourcecode","Private",true);
				ctx.msg.channel.send(embed)
			}
		}
	]
}
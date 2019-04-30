module.exports = {
	_metadata:{
		core:false,
		hasInit:false,
		features:["commands","events"],
		defaults: {
			enabled: false,
			settings: {
				enableDownvoting: false,
				voteUpReaction:"",
				voteDownReaction:"",
				threshold:5,
				channel:""
			}
		}
	},
	events: {
		"messageReactionAdd": function(ctx, reaction, user) {
			reactionStarboardHandler(ctx,reaction.message,reaction);
		},
		"messageReactionRemove": function(ctx, reaction, user) {
			reactionStarboardHandler(ctx,reaction.message,reaction);
		},
		"messageReactionRemoveAll": function(ctx, message) {
			reactionStarboardHandler(ctx,message);
		},
		"messageUpdate": function(ctx, oldMessage, newMessage){
			//TODO: clean this up
			if(newMessage.channel.type == "text" && newMessage.guild && !newMessage.author.bot){
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
				ctx.modules["core/configuration"].getConfig(ctx, newMessage.guild.id, function(conf){
					if(conf != false){
						var sbConfig = conf.moduleSettings.general.starboard;
						var count = 0;
						var hit = false;
						newMessage.reactions.forEach(reaction => {
							if((":" + reaction.emoji.name + ":") == sbConfig.voteUpReaction || reaction.emoji.toString() == sbConfig.voteUpReaction){
								if(reaction.emoji.guild){
									if(reaction.emoji.guild.id != newMessage.guild.id) return;
								}
								count += reaction.count;
								hit = true;
							}
							if(sbConfig.enableDownvoting){
								if((":" + reaction.emoji.name + ":") == sbConfig.voteDownReaction || reaction.emoji.toString() == sbConfig.voteDownReaction){
									if(reaction.emoji.guild){
										if(reaction.emoji.guild.id != newMessage.guild.id) return;
									}
									count -= reaction.count;
									hit = true;
								}
							}
						})
						if(hit){
							ctx.modules["core/database"].getData(ctx, "starboard", {messageID: newMessage.id}, function (result){
								if(count >= sbConfig.threshold){
									
									
									if(result != false){
										ctx.client.guilds.get(newMessage.guild.id).channels.get(sbConfig.channel).fetchMessage(result.sbMessageID)
											.then(sbm => {
												// ok
												sbm.edit(generateStarboardEmbed(ctx, newMessage, count))
											})
											.catch(err => {
												logger.error(err.stack);
											});
									}else{
										ctx.client.guilds.get(newMessage.guild.id).channels.get(sbConfig.channel).send(generateStarboardEmbed(ctx, newMessage, count))
											.then(sbm => {
												var newData = {
													messageID: newMessage.id,
													sbMessageID: sbm.id
												};
												ctx.modules["core/database"].insertData(ctx, "starboard", newData, function (result){
													// cool
												});
											})
											.catch(err => {
												logger.error(err.stack);
											});
									}

								}else{
									if(result != false){
										ctx.client.guilds.get(message.guild.id).channels.get(sbConfig.channel).fetchMessage(result.sbMessageID)
											.then(sbm => {
												sbm.delete();
												// ok
												ctx.modules["core/database"].removeData(ctx, "starboard", {messageID: message.id}, function (result){
													// neat;
												});
											})
											.catch(err => {
												logger.error(err.stack);
											});
									}	
									
								}
							})
							
						}
					}
				});
			}
		}
	},
	commands:[
		{
			aliases:["testsb"],
			helpSyntax: "testsb",
			description: "runs a starboard test",
			callback: function(ctx){
				if(ctx.msg.author.id == "150463430430687233"){
					var embed = new ctx.Discord.RichEmbed({
						color:0xf45f42
					});
					embed.setAuthor(ctx.msg.member.displayName + " (" + ctx.msg.member.id + ")", ctx.msg.author.avatarURL);
					embed.addField("Channel","<#" + ctx.msg.channel.id + ">")
					embed.addField("Message",ctx.msg.cleanContent.substring(0,500) + ((ctx.msg.cleanContent.length > 500)?"...":"") + "\n[Link to Message](" + "https://discordapp.com/channels/"+ ctx.msg.guild.id + "/" + ctx.msg.channel.id + "/" + ctx.msg.id + ")");
					embed.setFooter("5 ✔️ | " + new Date())
					ctx.msg.attachments.forEach(attachment => {
						embed.setImage(attachment.url)
					})
					//embed.addField("","");
					
					ctx.msg.channel.send(embed)
				}
			}
		}
	]
};

function reactionStarboardHandler(ctx,message,re){
	
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
	ctx.modules["core/configuration"].getConfig(ctx, message.guild.id, function(conf){
		if(conf != false){
			var sbConfig = conf.moduleSettings.general.starboard;
			var count = 0;
			var hit = false;
			message.reactions.forEach(reaction => {
				if((":" + reaction.emoji.name + ":") == sbConfig.voteUpReaction || reaction.emoji.toString() == sbConfig.voteUpReaction){
					if(reaction.emoji.guild){
						if(reaction.emoji.guild.id != message.guild.id) return;
					}
					count += reaction.count;
					hit = true;
				}
				if(sbConfig.enableDownvoting){
					if((":" + reaction.emoji.name + ":") == sbConfig.voteDownReaction || reaction.emoji.toString() == sbConfig.voteDownReaction){
						if(reaction.emoji.guild){
							if(reaction.emoji.guild.id != message.guild.id) return;
						}
						count -= reaction.count;
						hit = true;
					}
				}
			})
			if(!hit && re){
				if((":" + re.emoji.name + ":") == sbConfig.voteUpReaction || re.emoji.toString() == sbConfig.voteUpReaction ||  
					sbConfig.enableDownvoting && ((":" + re.emoji.name + ":") == sbConfig.voteDownReaction || re.emoji.toString() == sbConfig.voteDownReaction)){
					if(re.emoji.guild){
						if(re.emoji.guild.id != message.guild.id) return;
					}
					hit = true;
				}
			}
			if(hit){
				ctx.modules["core/database"].getData(ctx, "starboard", {messageID: message.id}, function (result){
					if(count >= sbConfig.threshold){
						
						
						if(result != false){
							ctx.client.guilds.get(message.guild.id).channels.get(sbConfig.channel).fetchMessage(result.sbMessageID)
								.then(sbm => {
									// ok
									sbm.edit(generateStarboardEmbed(ctx, message, count))
								})
								.catch(err => {
									logger.error(err.stack);
								});
						}else{
							ctx.client.guilds.get(message.guild.id).channels.get(sbConfig.channel).send(generateStarboardEmbed(ctx, message, count))
								.then(sbm => {
									var newData = {
										messageID: message.id,
										sbMessageID: sbm.id
									};
									ctx.modules["core/database"].insertData(ctx, "starboard", newData, function (result){
										// cool
									});
								})
								.catch(err => {
									logger.error(err.stack);
								});
						}

					}else{
						if(result != false){
							ctx.client.guilds.get(message.guild.id).channels.get(sbConfig.channel).fetchMessage(result.sbMessageID)
								.then(sbm => {
									sbm.delete();
									// ok
									ctx.modules["core/database"].removeData(ctx, "starboard", {messageID: message.id}, function (result){
										// neat;
									});
								})
								.catch(err => {
									logger.error(err.stack);
								});
						}	
						
					}
				})
				
			}
		}
	});
}

function generateStarboardEmbed(ctx, message, count){
	var embed = new ctx.Discord.RichEmbed({
		color:0xf45f42
	});
	embed.setAuthor(((message.member)?message.member.displayName:message.author.username) + " (" + message.author.id + ")", message.author.avatarURL);
	embed.addField("Channel","<#" + message.channel.id + ">")
	embed.addField("Message",((message.cleanContent.length > 0)?(message.cleanContent.substring(0,500) + ((message.cleanContent.length > 500)?"...":"")):"") + "\n[Link to Message](" + "https://discordapp.com/channels/"+ message.guild.id + "/" + message.channel.id + "/" + message.id + ")");
	embed.setFooter(count + " ✔️ | " + new Date())
	message.attachments.forEach(attachment => {
		embed.setImage(attachment.url)
	})
	return embed;
}
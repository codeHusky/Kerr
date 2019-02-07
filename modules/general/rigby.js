module.exports = {
	_metadata:{
		core:false,
		hasInit:true,
		features:["commands"],
		defaults: {
			enabled: false,
			settings: {
				channel:""
			}
		}
	},
	init:function(ctx){

	},
	scrapeRigbyPosts:scrapeRigbyPosts,
	commands: [
		{
			aliases: ["rigbytest"],
			helpSyntax: "rigbytest",
			description: "runs a rigby test.",
			callback: function(ctx){
				if(ctx.msg.channel.id == "542842222786117632"  && ctx.msg.author.id == "150463430430687233"){
					ctx.msg.channel.send("Scraping rigby.");
					ctx.modules["general/rigby"].lastPosts = (ctx.modules["general/rigby"].posts)?JSON.parse(JSON.stringify(ctx.modules["general/rigby"].posts)):[];
					ctx.modules["general/rigby"].posts = [];
					ctx.modules["general/rigby"].scrapeRigbyPosts(ctx,function(post) {
						ctx.modules["general/rigby"].posts[ctx.modules["general/rigby"].idOrder.indexOf(post.id)] = post;
						//ctx.msg.channel.send("```json\n" + JSON.stringify(post,null,2) + "\n```");
						if(ctx.modules["general/rigby"].pendingIDs.length == 0){
							if(ctx.modules["general/rigby"].lastPosts.length != 0 && ctx.modules["general/rigby"].lastPosts[0].id != ctx.modules["general/rigby"].posts[0].id){
								var everNew = false;
								for(var i = ctx.modules["general/rigby"].posts.length-1; i >= 0; i--){
									var newPost = true;
									for(var j = 0; j < ctx.modules["general/rigby"].lastPosts.length; j++){
										if(ctx.modules["general/rigby"].posts[i].id ==  ctx.modules["general/rigby"].lastPosts[j].id){
											newPost = false;
										}
									}
									if(newPost){
										everNew = true;
										ctx.msg.channel.send("New rigby.space post: **" + ctx.modules["general/rigby"].posts[i].title + "** by *~" + ctx.modules["general/rigby"].posts[i].author + "*")
									}
								}
								if(!everNew){
									ctx.msg.channel.send("No new rigby.space posts.")
								}
							}else{
								ctx.msg.channel.send("No new rigby.space posts.")
							}
						}
					})
				}
			}
		}
	]
};

const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://rigby.space/browse/recent';
function scrapeRigbyPosts(ctx,postCB){
	rp({url:url,strictSSL: false})
		.then(function(html){
			//success!
			var posts = $('.linkList', html);
			ctx.modules["general/rigby"].idOrder = [];
			ctx.modules["general/rigby"].pendingIDs = [];
			for(var i = 0; i < posts.length; i++){
				var post = $(posts[i]);
				var link = $("a",post)[0].attribs.href;
				var _id = link.split("/")[link.split("/").length-1];
				ctx.modules["general/rigby"].pendingIDs.push(_id);
				ctx.modules["general/rigby"].idOrder.push(_id);
				rp({url:"https://rigby.space" +  link,strictSSL: false})
					.then(function(html){
						//success!
						var id = $('#voteButton', html)[0].attribs.href.split("/");
							id = id[id.length-1];
						var content = $('pre', html).text();
						var title = $("h3",html).text();
						var author = $("#authorLink > a",html).text();
						var aL = $("#authorLink", html).text().split(" ");
						var postDate = aL[aL.length-1];
						ctx.modules["general/rigby"].pendingIDs.splice(ctx.modules["general/rigby"].pendingIDs.indexOf(id),1);
						postCB({
							id:id,
							content:content,
							title:title,
							author:author,
							postDate:postDate
						})
					})
					.catch(function(err){
						//handle error
						console.log(err);
					});
			}
			//console.log($('.linkList', html));
		})
		.catch(function(err){
			//handle error
			console.log(err);
		});
}

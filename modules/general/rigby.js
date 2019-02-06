module.exports = {
	_metadata:{
		core:false,
		hasInit:false,
		features:[],
		defaults: {
			enabled: false,
			settings: {
				channel:""
			}
		}
	}
};

const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://rigby.space/browse/recent';
rp({url:url,strictSSL: false})
	.then(function(html){
		//success!
		var posts = $('.linkList', html);
		for(var i = 0; i < posts.length; i++){
			var post = $(posts[i]);
			var link = $("a",post)[0].attribs.href;
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

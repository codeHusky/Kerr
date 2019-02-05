module.exports = {
	/*
		DB Types:
		mongodb, sql (roadmap)
	*/
	dbType:"mongodb",
	mongodb: {
		url:"mongodb://localhost:27017",
		database:"kerr"
	},
	defaultGuildConfig: {
		prefix:"k!",
		modules:{
			// Make sure to add modules to this if you create more.
			general:{
				rigby:false,
				starboard:true
			},
			moderation: {
				antiflood:false,
				filter:false,
				logs:false,
				tools:true
			}
		},
		commandBlacklist:[],
		moduleSettings:{
			moderation: {
				logs: {
					channel: "",
					logFilterMode:"whitelist",
					logWhitelist: [],
					logBlacklist: []
				},
				antiflood:{
					// idk yet
				},
				filter: {
					bannedWords:[],
					sensitivity: 80, //must be 80% confident to filter
				},
				tools: {
					minReasonLength:10
				}
			},
			general: {
				rigby: {
					channel:""
				},
				starboard: {
					enableDownvoting: false,
					voteUpReaction:"",
					voteDownReaction:"",
					threshold:5
				}
			}
		}
	},
}
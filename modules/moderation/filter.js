module.exports = {
	_metadata:{
		core:false,
		hasInit:false,
		features:["commands"],
		defaults: {
			enabled: false,
			settings: {
				bannedWords:[],
				sensitivity: 80, //must be 80% confident to filter
			}
		}
	},
	commands:{
		
	}
};
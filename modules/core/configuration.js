module.exports = {
	_metadata:{
		core:true,
		priority:0,
		features:["commands"]
	},
	getConfig: function(guildID){
		//TODO: actually pull from data source
		return {
			prefix:"k!"
		}
	},
	commands:[]
}
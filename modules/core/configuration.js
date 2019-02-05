module.exports = {
	_metadata:{
		core:true,
		hasInit:false,
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
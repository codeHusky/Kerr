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
		modules:{},
		commandBlacklist:[],
		moduleSettings:{}
	},
}
/*
Autofetch module defaults
*/
const fs = require("fs");
var moduleDirs = fs.readdirSync("modules/");
for(var i = 0; i < moduleDirs.length; i++){
	var category = moduleDirs[i].toString();
	var modFiles = fs.readdirSync("modules/" + category + "/")
	for(var j = 0; j < modFiles.length; j++){
		var id = modFiles[j].toString().replace(".js","");
		var proto = require("./modules/" + category + "/" + modFiles[j].toString());
		if(proto.hasOwnProperty("_metadata")){
			var moduleID = moduleDirs[i] + "/" + id;
			console.log(moduleID);
			if(proto._metadata.hasOwnProperty("defaults")){
				if(!module.exports.defaultGuildConfig.modules.hasOwnProperty(category)){
					module.exports.defaultGuildConfig.modules[category] = {};
				}
				module.exports.defaultGuildConfig.modules[category][id] = proto._metadata.defaults.enabled;
				if(!module.exports.defaultGuildConfig.moduleSettings.hasOwnProperty(category)){
					module.exports.defaultGuildConfig.moduleSettings[category] = {};
				}
				module.exports.defaultGuildConfig.moduleSettings[category][id] = proto._metadata.defaults.settings;
				console.log("set defaults")
			}
		}
	}
}
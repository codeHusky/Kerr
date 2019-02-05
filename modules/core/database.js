module.exports = {
	_metadata:{
		core:true,
		hasInit:true,
		priority:0,
		features:[],
	},
	init: function(ctx) {
		ctx.logger.info(ctx.selfMod.id,"Starting initialization sequence...")
		ctx.logger.info(ctx.selfMod.id,"Initialization complete.")
	}
}
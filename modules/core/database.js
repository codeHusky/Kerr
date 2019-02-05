/**************************************
* core/database
***************************************
* This module is for interfacing with
* the database of your choice.
* Feel free to add support for any
*/
const MongoClient = require('mongodb').MongoClient;
module.exports = {
	_metadata:{
		core:true,
		hasInit:true,
		priority:0,
		features:[],
	},
	init: function(ctx) {
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/database"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/database"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/database"].id,txt);
			}
		}

		logger.info("Starting initialization sequence...")

		ctx.modules["core/database"].connectDB(ctx);

		//TODO: connect to database
		
	},
	connectDB: function(ctx){
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/database"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/database"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/database"].id,txt);
			}
		}
		switch(ctx.globalConfig.dbType.toLowerCase()){
			case "mongodb":
				logger.info("using mongodb database.")
				const client = new MongoClient(ctx.globalConfig.mongodb.url,{useNewUrlParser:true});
				client.connect(function (err){
					if(err){
						logger.error("Error connecting to database");
						logger.error(JSON.stringify(err));
						logger.error("Failed to initalize database. Trying again in 5 seconds...");
						setTimeout(function() {
							ctx.modules["core/database"].connectDB(ctx);
						},5000);
						return;
					}
					const db = client.db(ctx.globalConfig.mongodb.database);
					logger.info("Connected successfully");
					ctx.modules["core/database"].client = client;
					ctx.modules["core/database"].ready = true;
					logger.info("Initialization complete.")
				})
				break;
			case "sql":
				logger.error("SQL is not supported at this time.");
			default:
				logger.error("No valid db type given, shutting down.");
				process.exit(1);
				break;
		}
		
	},
	initalizeTable: function(ctx,tableData,callback) {
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/database"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/database"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/database"].id,txt);
			}
		}
		switch(ctx.globalConfig.dbType.toLowerCase()){
			case "mongodb":
				callback();
				//not neccesary, mongodb doesnt have strict tables.
				break;
		}
	},
	updateData: function(ctx, table, data, callback){ 
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/database"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/database"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/database"].id,txt);
			}
		}
		switch(ctx.globalConfig.dbType.toLowerCase()){
			case "mongodb":
				const client = ctx.modules["core/database"].client;
				const db = client.db(ctx.globalConfig.mongodb.database);

				const collection = db.collection(table);
				/*
					data-->
						{
							where: {
								"key":"value"
							},
							set:{
								"key":"value",
								...
							}
						}
				*/
				collection.updateMany(data.where,{
					$set: data.set
				}, function(err, result) {
					if(err){
						logger.error("Error occured during update: " + data);
						logger.error(JSON.stringify(err));
						callback(false);
					}else{
						callback(true);
					}
				});
				break;
		}
	},
	insertData: function(ctx, table, data, callback){ 
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/database"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/database"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/database"].id,txt);
			}
		}
		switch(ctx.globalConfig.dbType.toLowerCase()){
			case "mongodb":
				const client = ctx.modules["core/database"].client;
				const db = client.db(ctx.globalConfig.mongodb.database);

				const collection = db.collection(table);
				/*
					data-->
						{
							where: {
								"key":"value"
							},
							set:{
								"key":"value",
								...
							}
						}
				*/
				collection.insertOne(data, function(err, result) {
					if(err){
						logger.error("Error occured during insert: " + data);
						logger.error(JSON.stringify(err));
						callback(false);
					}else{
						callback(true);
					}
				})
				break;
		}
	},
	getData: function(ctx, table, filter, callback){
		const logger = {
			info:function(txt){
				ctx.logger.info(ctx.modules["core/database"].id,txt);
			},
			warn:function(txt){
				ctx.logger.warn(ctx.modules["core/database"].id,txt);
			},
			error:function(txt){
				ctx.logger.error(ctx.modules["core/database"].id,txt);
			}
		}
		switch(ctx.globalConfig.dbType.toLowerCase()){
			case "mongodb":
				const client = ctx.modules["core/database"].client;
				const db = client.db(ctx.globalConfig.mongodb.database);

				const collection = db.collection(table);

				collection.findOne(filter, function(err, result) {
					if(err){
						logger.error("Error occured during find: " + data);
						logger.error(JSON.stringify(err));
						callback(false);
					}else{
						callback((result)?result:false);
					}
				})
				break;
		}
	}
}
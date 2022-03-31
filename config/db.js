const mongoose = require("mongoose");

const uri =
	process.env.NODE_ENV === "production"
		? process.env.MONGO_CLOUD
		: process.env.MONGO_LOCAL;

exports.connectDB = async () => {
	await mongoose
		.connect(uri)
		.then(() => {
			console.log("DB connected.");
		})
		.catch((error) => {
			console.log(error);
			throw new Error(error);
		});
};

exports.closeDBConnection = () => {
	return mongoose.disconnect();
};

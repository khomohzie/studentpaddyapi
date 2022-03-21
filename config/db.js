const mongoose = require("mongoose");

const uri = process.env.MONGO_LOCAL;

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

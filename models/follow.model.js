const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
	user_name: {
		type: String,
		required: [true, "Name of followed user is required!"],
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "Id of followed user is required!"],
	},
	follower_name: {
		type: String,
		required: [true, "Name of follower is required!"],
	},
	follower_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "Id of follower is required!"],
	},
});

module.exports = mongoose.model("Follow", followSchema);

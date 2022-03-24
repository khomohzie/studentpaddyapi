const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	community_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Community",
	},
	followers: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model("Topic", topicSchema);

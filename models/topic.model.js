const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		community_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
		},
		community_name: {
			type: String,
		},
		followers: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);

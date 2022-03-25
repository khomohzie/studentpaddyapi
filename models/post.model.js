const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
	{
		topic: {
			type: String,
			minlength: 3,
			maxlength: 50,
		},
		topic_id: {
			type: ObjectId,
			ref: "Topic",
		},
		poster: {
			type: ObjectId,
			ref: "User",
			required: true,
		},
		content: { type: String, required: [true, "There is no content."] },
		type: {
			type: String,
			enum: ["post", "question", "file", "link", "comment"],
			required: [true, "What type of post is this?"],
		},
		parent_post_id: {
			type: ObjectId,
			ref: "Post",
		},
		community_name: {
			type: String,
		},
		community_id: {
			type: ObjectId,
			ref: "Community",
		},
		upvotes: {
			type: Number,
			default: 0,
		},
		downvotes: {
			type: Number,
			default: 0,
		},
		reposts: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);

const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
			required: true,
		},
		creator: {
			type: String,
			required: true,
		},
		cover_photo: {
			type: String,
		},
	},
	{ timestamps: true }
);

const communityContributorSchema = new mongoose.Schema(
	{
		community_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		user_name: {
			type: String,
			required: true,
		},
		user_image: {
			type: String,
		},
		owner: {
			type: Boolean,
		},
		contributions: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const communityFollowerSchema = new mongoose.Schema(
	{
		community_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		user_name: {
			type: String,
			required: true,
		},
		user_image: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);
const CommunityContributor = mongoose.model(
	"Community Contributor",
	communityContributorSchema
);
const CommunityFollower = mongoose.model(
	"Community Follower",
	communityFollowerSchema
);

module.exports = {
	Community,
	CommunityContributor,
	CommunityFollower,
};

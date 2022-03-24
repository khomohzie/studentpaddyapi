const { translateError } = require("../helpers/mongo_helper");
const Follow = require("../models/follow.model");
const User = require("../models/user.model");

exports.followUser = async (req, res) => {
	try {
		const userToFollow = await User.findOne({
			username: req.params.username,
		}).exec();

		const followedFullname = `${userToFollow.firstname} ${userToFollow.lastname}`;

		// We want to make sure a user cannot follow their own account.
		const myself = await User.findOne({ _id: req.user._id }).exec();
		if (myself.username === req.params.username) {
			return res
				.status(400)
				.json({ error: "You cannot follow yourself" });
		}

		const follower = await User.findOne({ _id: req.user._id }).exec();

		const followerFullname = `${follower.firstname} ${follower.lastname}`;

		const follow = new Follow({
			user_name: followedFullname,
			user_id: userToFollow._id,
			follower_name: followerFullname,
			follower_id: follower._id,
		});

		await follow.save((err, data) => {
			if (err) {
				return res.status(500).json({ error: translateError(err) });
			}

			res.json({
				message: `You are now following ${followedFullname}`,
				data,
			});
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.unFollowUser = async (req, res) => {
	try {
		const userToUnfollow = await User.findOne({
			username: req.params.username,
		}).exec();

		const fullname = `${userToUnfollow.firstname} ${userToUnfollow.lastname}`;

		Follow.deleteOne({
			user_id: userToUnfollow._id,
			follower_id: req.user._id,
		}).exec((err, deleted) => {
			if (err || deleted.deletedCount === 0) {
				return res.status(500).json({ error: "Never followed them." });
			}
			res.json({
				message: `You have unfollowed ${fullname}`,
			});
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.getFollowers = async (req, res) => {
	try {
		const followers = await Follow.find({ user_id: req.params.id }).exec();

		res.json({ followersCount: followers.length, followers });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.getFollowings = async (req, res) => {
	try {
		const followings = await Follow.find({
			follower_id: req.params.id,
		}).exec();

		res.json({ followingsCount: followings.length, followings });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

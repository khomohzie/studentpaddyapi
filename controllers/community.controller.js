const { Community } = require("../models/community.model");
const { CommunityContributor } = require("../models/community.model");
const { CommunityFollower } = require("../models/community.model");
const User = require("../models/user.model");
const { firebaseUpload } = require("../helpers/firebase_upload");
const { translateError } = require("../helpers/mongo_helper");

exports.create = async (req, res) => {
	const data = JSON.parse(req.body.data);
	try {
		const { name, description } = data;

		const communityExists = await Community.findOne({ name }).exec();
		if (communityExists)
			return res.status(400).json({ error: "Community already exists!" });

		let cover_photo;

		const creator = await User.findById({ _id: req.user._id })
			.select(["-password", "-reset_password_pin"])
			.exec();

		let creatorName = `${creator.firstname} ${creator.lastname}`;

		if (req.file) {
			await firebaseUpload(req.file).then(
				(downloadURL) => {
					cover_photo = downloadURL;
				},
				(error) => {
					console.error("FIREBASE ERROR ==>", error);
				}
			);
		}

		const community = new Community({
			name,
			description,
			creator: creatorName,
			cover_photo,
		});

		await community.save(async (err, response) => {
			if (err) {
				return res.status(401).json({ error: translateError(err) });
			}

			const communityContributor = new CommunityContributor({
				community_id: response._id,
				user_id: req.user._id,
				user_name: creatorName,
				user_image: creator.photo,
				owner: true,
			});

			await communityContributor.save((err, contributor) => {
				if (err) {
					return res.status(401).json({ error: translateError(err) });
				}
			});

			return res.json(response);
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.getAll = async (req, res) => {
	try {
		const communities = await Community.aggregate([
			{
				$lookup: {
					from: "community followers",
					localField: "_id",
					foreignField: "community_id",
					as: "followers",
				},
			},
			{
				$addFields: { followersCount: { $size: "$followers" } },
			},
			{
				$lookup: {
					from: "topics",
					localField: "_id",
					foreignField: "community_id",
					as: "topics",
				},
			},
			{
				$addFields: { topicsCount: { $size: "$topics" } },
			},
		]);

		res.json(communities);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.readCommunity = async (req, res) => {
	try {
		const community = await Community.aggregate([
			{
				$match: {
					name: req.params.name,
				},
			},
			{
				$lookup: {
					from: "community contributors",
					localField: "_id",
					foreignField: "community_id",
					as: "contributors",
				},
			},
			{ $addFields: { contributorsCount: { $size: "$contributors" } } },
			{
				$lookup: {
					from: "community followers",
					localField: "_id",
					foreignField: "community_id",
					as: "followers",
				},
			},
			{
				$addFields: { followersCount: { $size: "$followers" } },
			},
		]);

		if (!community) {
			return res
				.status(400)
				.json({ error: "Community data is not available!" });
		}

		res.json(community);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.followCommunity = async (req, res) => {
	try {
		const alreadyFollowed = await CommunityFollower.findOne({
			community_id: req.params.id,
			user_id: req.user._id,
		}).exec();

		if (alreadyFollowed)
			return res
				.status(400)
				.json({ error: "You are already following community!" });

		const community = await Community.findOne({
			_id: req.params.id,
		}).exec();

		if (!community)
			return res.status(400).json({ error: "Cannot follow community!" });

		const user = await User.findById({ _id: req.user._id })
			.select(["-password", "-reset_password_pin"])
			.exec();

		let user_name = `${user.firstname} ${user.lastname}`;

		const follower = new CommunityFollower({
			community_id: req.params.id,
			user_id: req.user._id,
			user_name,
			user_image: user.image,
		});

		await follower.save((err, doc) => {
			if (err)
				return res.status(401).json({ error: translateError(err) });

			res.json(doc);
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.unFollowCommunity = async (req, res) => {
	try {
		const community = await CommunityFollower.findOne({
			community_id: req.params.id,
			user_id: req.user._id,
		}).exec();

		if (!community)
			return res
				.status(400)
				.json({ error: "Cannot unfollow community!" });

		await CommunityFollower.deleteOne(community).exec();

		res.json({ message: "Successful!" });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

const Topic = require("../models/topic.model");
const { Community } = require("../models/community.model");
const { translateError } = require("../helpers/mongo_helper");

exports.create = async (req, res) => {
	try {
		const { name, community } = req.body;

		const topicExists = await Topic.findOne({ name }).exec();

		if (topicExists) {
			return res.status(400).json({ message: "Topic already exists." });
		} else {
			const communityData = await Community.findOne({
				name: community,
			}).exec();

			const topic = new Topic({ name, community_id: communityData?._id });

			await topic.save((err, data) => {
				if (err) {
					return res.status(500).json({ error: translateError(err) });
				}

				return res.json(data);
			});
		}
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.getAll = async (req, res) => {
	try {
		const topics = await Topic.aggregate([
			{
				$lookup: {
					from: "posts",
					localField: "_id",
					foreignField: "topic_id",
					as: "posts",
				},
			},
			{
				$addFields: { contributions: { $size: "$posts" } },
			},
		]);

		res.json(topics);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.readTopic = async (req, res) => {
	try {
		const topic = await Topic.aggregate([
			{
				$match: {
					name: req.params.name,
				},
			},
			{
				$lookup: {
					from: "posts",
					localField: "_id",
					foreignField: "topic_id",
					as: "posts",
				},
			},
			{
				$addFields: { contributions: { $size: "$posts" } },
			},
		]);

		res.json(topic);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.followTopic = async (req, res) => {
	try {
		const topic = await Topic.findOne({ _id: req.params.id }).exec();

		if (!topic)
			return res.status(400).json({ error: "Cannot follow topic!" });

		let followers = topic.followers + 1;

		Topic.updateOne(
			{ _id: req.params.id },
			{
				$set: {
					followers,
				},
			},
			{ new: true }
		).exec((err, success) => {
			if (err) {
				return res.status(500).json({ error: translateError(err) });
			}

			res.json({ message: `You now follow ${topic.name}` });
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.unFollowTopic = async (req, res) => {
	try {
		const topic = await Topic.findOne({ _id: req.params.id }).exec();

		if (!topic)
			return res.status(400).json({ error: "Cannot unfollow topic!" });

		let followers = topic.followers - 1;

		Topic.updateOne(
			{ _id: req.params.id },
			{
				$set: {
					followers,
				},
			},
			{ new: true }
		).exec((err, success) => {
			if (err) {
				return res.status(500).json({ error: translateError(err) });
			}

			res.json({ message: `You have unfollowed ${topic.name}` });
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

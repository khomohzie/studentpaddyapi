const Post = require("../models/post.model");
const Topic = require("../models/topic.model");
const { Community } = require("../models/community.model");
const { firebaseUpload } = require("../helpers/firebase_upload");
const { translateError } = require("../helpers/mongo_helper");

exports.create = async (req, res) => {
	try {
		const data = JSON.parse(req.body.data);

		let content, topic_id;

		if (req.file) {
			await firebaseUpload(req.file).then(
				(downloadURL) => {
					content = downloadURL;
				},
				(error) => {
					console.error("FIREBASE ERROR ==>", error);
				}
			);
		} else {
			content = data.content;
		}

		const community = await Community.findOne({
			name: data.community_name,
		}).exec();

		const topic = await Topic.findOne({ name: data.topic }).exec();

		if (!topic) {
			let newTopic;

			if (data.community_name) {
				newTopic = new Topic({
					name: data.topic,
					community_id: community._id,
				});
			} else {
				newTopic = new Topic({ name: data.topic });
			}

			const savedTopic = await newTopic.save();

			topic_id = savedTopic._id;
		} else {
			topic_id = topic._id;
		}

		const post = new Post({
			topic: data.topic,
			topic_id,
			poster: req.user._id,
			content,
			type: req.query.type,
			parent_post_id: data.parent_post_id,
			community_name: data.community_name,
			community_id: community._id,
		});

		await post.save((err, postdata) => {
			if (err) {
				return res.status(500).json({ error: translateError(err) });
			}

			res.json(postdata);
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Something went wrong! Please try again.",
		});
	}
};

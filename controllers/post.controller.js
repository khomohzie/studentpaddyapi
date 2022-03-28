const Post = require("../models/post.model");
const Topic = require("../models/topic.model");
const User = require("../models/user.model");
const { Community } = require("../models/community.model");
const { firebaseUpload } = require("../helpers/firebase_upload");
const { translateError } = require("../helpers/mongo_helper");
const { default: mongoose } = require("mongoose");

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

		if (!topic && data.topic) {
			const newTopic = new Topic({
				name: data.topic,
				community_id: community?._id,
			});

			const savedTopic = await newTopic.save();

			topic_id = savedTopic._id;
		} else {
			topic_id = topic?._id;
		}

		const post = new Post({
			topic: data.topic,
			topic_id,
			poster: req.user._id,
			content,
			type: req.query.type,
			parent_post_id: data.parent_post_id,
			community_name: data.community_name,
			community_id: community?._id,
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

exports.getAll = async (req, res) => {
	try {
		const posts = await Post.find({ parent_post_id: undefined })
			.populate(
				"poster",
				"_id username firstname lastname institution photo"
			)
			.exec();

		res.json(posts);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Something went wrong! Please try again.",
		});
	}
};

exports.readPost = async (req, res) => {
	try {
		const id = mongoose.Types.ObjectId(req.params.id);

		const post = await Post.aggregate([
			{
				$match: {
					_id: id,
				},
			},
			{
				$lookup: {
					from: "posts",
					localField: "_id",
					foreignField: "parent_post_id",
					as: "comments",
				},
			},
			{
				$lookup: {
					from: "users",
					let: { comments: "$comments" },
					pipeline: [
						{
							$match: {
								$expr: { $in: ["$_id", "$$comments.poster"] },
							},
						},
						{
							$project: {
								_id: 0,
								poster: {
									_id: "$_id",
									firstname: "$firstname",
									lastname: "$lastname",
									username: "$username",
									institution: "$institution",
									photo: "$photo",
								},
							},
						},
					],
					as: "commentPosters",
				},
			},
			{
				$project: {
					_id: 1,
					topic: 1,
					topic_id: 1,
					poster: 1,
					content: 1,
					type: 1,
					community_name: 1,
					community_id: 1,
					upvotes: 1,
					downvotes: 1,
					reposts: 1,
					createdAt: 1,
					updatedAt: 1,
					__v: 1,
					comments: {
						$map: {
							input: "$comments",
							as: "comment",
							in: {
								$mergeObjects: [
									"$$comment",
									{
										$first: {
											$filter: {
												input: "$commentPosters",
												cond: {
													$eq: [
														"$$this.poster._id",
														"$$comment.poster",
													],
												},
											},
										},
									},
								],
							},
						},
					},
				},
			},
		]);

		await User.populate(post, {
			path: "poster",
			select: {
				firstname: 1,
				lastname: 1,
				username: 1,
				institution: 1,
				photo: 1,
			},
		});

		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Something went wrong! Please try again.",
		});
	}
};

const Post = require("../models/post.model");
const User = require("../models/user.model");

exports.getResources = async (req, res) => {
	try {
		let type;
		if (req.query.type === "file") {
			type = "file";
		} else {
			type = "link";
		}

		const resources = await Post.aggregate([
			{
				$match: {
					type: type,
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
				$addFields: { comments: { $size: "$comments" } },
			},
		]);

		await User.populate(resources, {
			path: "poster",
			select: {
				firstname: 1,
				lastname: 1,
				username: 1,
				institution: 1,
				photo: 1,
			},
		});

		if (req.query.community) {
			res.json(resources);
		}

		if (req.query.sortBy === "newest") {
			res.json(
				resources
					.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
					.filter(
						(a) =>
							a.community_name ===
							(req.query.filterBy
								? req.query.filterBy
								: a.community_name)
					)
			);
		} else if (req.query.sortBy === "oldest") {
			res.json(
				resources
					.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
					.filter(
						(a) =>
							a.community_name ===
							(req.query.filterBy
								? req.query.filterBy
								: a.community_name)
					)
			);
		} else {
			res.json(
				resources.filter(
					(a) =>
						a.community_name ===
						(req.query.filterBy
							? req.query.filterBy
							: a.community_name)
				)
			);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Something went wrong! Please try again.",
		});
	}
};

exports.getUnansweredQuestions = async (req, res) => {
	try {
		//
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Something went wrong! Please try again.",
		});
	}
};

exports.getAnsweredQuestions = async (req, res) => {
	try {
		//
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Something went wrong! Please try again.",
		});
	}
};

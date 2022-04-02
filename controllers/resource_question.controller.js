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

		const aggregationPipeline = [
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
		];

		if (req.query.filterBy) {
			aggregationPipeline.unshift({
				$match: { community_name: req.query.filterBy },
			});
		}

		switch (req.query.sortBy) {
			case "recent":
				/**
				 * Basically, I cannot sort a non-existing field. comments is a number not an object.
				 * This is as a result of the last stage in the pipeline.
				 * So I have to first remove that stage using pop() method and then sort appropriately.
				 * I still don't want the comments details though so I push back the removed stage.
				 */

				aggregationPipeline.pop();
				aggregationPipeline.push(
					{ $sort: { "comments.createdAt": -1 } },
					{
						$addFields: { comments: { $size: "$comments" } },
					}
				);
				break;

			case "newest":
				aggregationPipeline.push({ $sort: { createdAt: -1 } });
				break;

			case "oldest":
				aggregationPipeline.push({ $sort: { createdAt: 1 } });
				break;

			default:
				break;
		}

		const resources = await Post.aggregate(aggregationPipeline);

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

		res.json(resources);
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

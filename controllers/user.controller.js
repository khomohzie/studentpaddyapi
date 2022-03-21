const User = require("../models/user.model");
const { translateError } = require("../helpers/mongo_helper");
const { comparePassword, hashPassword } = require("../helpers/auth");
const { firebaseUpload } = require("../helpers/firebase_upload");

exports.userProfile = async (req, res) => {
	try {
		const user = await User.findOne(
			{ _id: req.params.id },
			{ password: 0, reset_password_pin: 0 }
		).exec();

		if (!user) return res.status(400).json({ error: "No user data!" });

		res.json(user);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.deleteAccount = (req, res) => {
	try {
		const user = User.findOne({ _id: req.user._id }).exec((err, user) => {
			if (err || !user) {
				return res.status(400).json({ error: "User does not exist!" });
			}

			User.deleteOne({ _id: req.user._id }).exec();
		});

		res.send("Account deleted successfully.");
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.updateAccount = async (req, res) => {
	const data = JSON.parse(req.body.data);
	try {
		const user = await User.findOne({ _id: req.user._id })
			.select(["-password", "-reset_password_pin"])
			.exec();

		if (!user) return res.status(400).json({ error: "No user found!" });

		// Make sure nobody can change password/pin illegally so store them temporarily
		const userPassword = user.password;
		const userResetPin = user.reset_password_pin;
		const userEmail = user.email;

		if (data.username) {
			const usernameTaken = await User.findOne({
				username: data.username,
			}).exec();

			if (usernameTaken)
				return res.status(400).json({ error: "username is taken!" });
		}

		// Upload image to firebase
		if (req.file) {
			await firebaseUpload(req.file)
				.then((downloadURL) => {
					user.photo = downloadURL;
				})
				.catch((error) => console.error(error));
		}

		// Check for fields with new value and assign to the user document for update
		for (const field in data) {
			user[field] = data[field];
		}

		// Now if someone entered a new password/pin illegally, revert to old password/pin
		user.password = userPassword;
		user.reset_password_pin = userResetPin;
		user.email = userEmail;

		User.updateOne({ _id: req.user._id }, user, {
			$new: true,
		}).exec((err, success) => {
			if (err)
				return res.status(500).json({ error: translateError(err) });
		});

		res.json(user);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { oldPassword, password } = req.body;

		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user) return res.status(400).json({ error: "No user found!" });

		const verifyPassword = await comparePassword(
			oldPassword,
			user.password
		);
		if (!verifyPassword) {
			return res
				.status(400)
				.json({ error: "Current password is wrong!" });
		}

		const hashedPassword = await hashPassword(password);

		User.updateOne(
			{ _id: req.user._id },
			{ $set: { password: hashedPassword } },
			{ $new: true }
		).exec();

		res.json({ message: "Password updated!" });
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.profileSetup = async (req, res) => {
	const data = JSON.parse(req.body.data);
	try {
		const user = await User.findOne({ _id: req.user._id }).exec();

		if (!user) return res.status(400).json({ error: "No user found!" });

		// Make sure nobody can change password/pin illegally so store them temporarily
		const userPassword = user.password;
		const userResetPin = user.reset_password_pin;
		const userEmail = user.email;

		// Upload image to firebase
		if (req.file) {
			await firebaseUpload(req.file)
				.then((downloadURL) => {
					user.photo = downloadURL;
				})
				.catch((error) => console.error(error));
		}

		// Check for fields with new value and assign to the user document for update
		for (const field in data) {
			user[field] = data[field];
		}

		// Now if someone entered a new password/pin illegally, revert to old password/pin
		user.password = userPassword;
		user.reset_password_pin = userResetPin;
		user.email = userEmail;

		User.updateOne({ _id: req.user._id }, user, {
			$new: true,
		}).exec((err, success) => {
			if (err)
				return res.status(500).json({ error: translateError(err) });

			res.json({ message: "Profile updated" });
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const sgMail = require("@sendgrid/mail");
const { translateError } = require("../helpers/mongo_helper");
const { isEmailValidator } = require("../validators/auth");
const { hashPassword, comparePassword } = require("../helpers/auth");

sgMail.setApiKey(process.env.SENDGRID);

// Email verification
exports.preRegister = async (req, res) => {
	try {
		const { email, username, country, password, confirmPassword } =
			req.body;

		const userExists = await User.findOne({ email }).exec();

		// Make a few verifications
		if (userExists)
			return res.status(400).json({ error: "User already exists!" });
		if (password !== confirmPassword)
			return res.status(401).json({ error: "Passwords do not match!" });

		const token = jwt.sign(
			{ email, username, country, password },
			process.env.JWT_ACCOUNT_ACTIVATION,
			{ expiresIn: "10m" }
		);

		const msg = {
			to: email,
			from: process.env.EMAIL_FROM,
			subject: "Verify your Account",
			html: `
			<h1>StudentPaddy</h1>
			<p>Please use the following link to activate your acccount.
			<br/>The link expires in 10 minutes.</p>
            <a>${process.env.CLIENT_URL}/auth/activate?token=${token}</a>
            <hr />
            <footer>This email may contain sensitive information</footer>
		`,
		};

		sgMail.send(msg).then(
			() => {
				return res.json({
					message: `Email has been sent to ${email}. Link expires in 10 minutes.`,
				});
			},
			(error) => {
				console.error(error);

				if (error.response) console.error(error.response.body);
			}
		);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

// exports.register = async (req, res) => {
// 	try {
// 		const token = req.body.token;

// 		if (token) {
// 			jwt.verify(
// 				token,
// 				process.env.JWT_ACCOUNT_ACTIVATION,
// 				(error, decoded) => {
// 					if (error)
// 						return res
// 							.status(401)
// 							.json({
// 								error: "Expired link! Please signup again.",
// 							});

// 					const { email, username, country, password } =
// 						jwt.decode(token);

//					const hashedPassword = await hashPassword(password);

// 					const user = new User({
// 						email,
// 						username,
// 						country,
// 						password: hashedPassword,
// 					});

// 					user.save((err, user) => {
// 						if (err) {
// 							return res.status(401).json({
// 								error: translateError(err),
// 							});
// 						}
// 						return res.json({
// 							message: "Signup success! Please signin",
// 						});
// 					});
// 				}
// 			);
// 		} else {
// 			return res.json({
// 				error: "Something went wrong. Try again",
// 			});
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		return res
// 			.status(500)
// 			.json({ error: "Something went wrong! Please try again." });
// 	}
// };

exports.register = async (req, res) => {
	try {
		const { email, username, country, password, confirmPassword } =
			req.body;

		const userExists = await User.findOne({ email }).exec();

		// Make a few verifications
		if (userExists)
			return res.status(400).json({ error: "User already exists!" });
		if (password !== confirmPassword)
			return res.status(401).json({ error: "Passwords do not match!" });

		const hashedPassword = await hashPassword(password);

		const user = new User({
			email,
			username,
			country,
			password: hashedPassword,
		});

		user.save((err, user) => {
			if (err) {
				return res.status(401).json({
					error: translateError(err),
				});
			}
			return res.json({
				message: "Signup success! Please signin",
			});
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.signin = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).exec();

		if (!user) {
			return res.status(400).json({
				error: "User with that email does not exist! Please signup!",
			});
		}
		// authenticate the entered password
		const verifyPassword = await comparePassword(password, user.password);
		if (!verifyPassword) {
			return res.status(401).json({
				error: "Email and password do not match.",
			});
		}
		// generate a token and send as cookie to client
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		user.password = undefined;
		user.reset_password_pin = undefined;

		res.cookie("token", token, { expiresIn: "1d" });

		return res.json({
			token,
			user,
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.signout = (req, res) => {
	res.clearCookie("token");
	res.status(200).send("Signout success!");
};

exports.requireSignin = expressjwt({
	secret: process.env.JWT_SECRET,
	algorithms: ["HS256"],
});

exports.forgotPassword = async (req, res) => {
	try {
		const { userId } = req.body;

		let user;

		if (isEmailValidator(userId)) {
			user = await User.findOne({ email: userId }).exec();

			if (!user) {
				return res.status(401).json({
					error: "User with that email does not exist! Please signup!",
				});
			}
		} else {
			user = await User.findOne({ username: userId }).exec();

			if (!user) {
				return res.status(401).json({
					error: "User with that username does not exist! Please signup!",
				});
			}
		}

		// credentials to reset password
		const resetPin = Math.floor(100000 + Math.random() * 900000);
		const pinExpiry = new Date().getTime() + 10 * 60000;

		const msg = {
			to: user.email,
			from: process.env.EMAIL_FROM,
			subject: "Reset your password",
			html: `
			<h1>StudentPaddy</h1>
			<p>Please use the following pin to reset your password.
			<br/>The pin expires in 10 minutes.</p>
			<h2 style="text-align: center">${resetPin}</h2>
			<p>You can use the link below to go directly to the reset password page.</p>
            <a>${process.env.CLIENT_URL}/auth/reset</a>
            <hr />
            <footer>This email may contain sensitive information</footer>
		`,
		};

		return user
			.updateOne({
				reset_password_pin: resetPin,
				reset_pin_expiry: pinExpiry,
			})
			.exec((err, success) => {
				if (err) {
					return res.status(500).json({ error: translateError(err) });
				} else {
					sgMail.send(msg).then(
						() => {},
						(error) => {
							console.error(error);
							if (error.response)
								console.error(error.response.body);
						}
					);
				}
			});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const { resetPin, password, confirmPassword } = req.body;

		const user = await User.findOne({
			reset_password_pin: resetPin,
		}).exec();

		if (!user) return res.status(401).json({ error: "Incorrect pin!" });

		const currentTime = new Date().getTime();

		if (currentTime > user.reset_pin_expiry) {
			return res.status(400).json({ error: "Pin is already expired!" });
		}

		if (password !== confirmPassword)
			return res.status(401).json({ error: "Passwords do not match!" });

		const hashedPassword = await hashPassword(password);

		return user
			.updateOne({
				password: hashedPassword,
				reset_password_pin: "",
				reset_pin_expiry: "",
			})
			.exec((err, success) => {
				if (err) {
					return res.status(500).json({ error: translateError(err) });
				}

				res.json({ message: "Password changed successfully." });
			});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: "Something went wrong! Please try again." });
	}
};

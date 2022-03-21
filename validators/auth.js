const { check } = require("express-validator");

exports.userSignupValidator = [
	check("email").isEmail().withMessage("Input a valid email address"),
	check("username").notEmpty().withMessage("Username is required"),
	check("country").notEmpty().withMessage("Please select a country"),
	check("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
];

exports.userSigninValidator = [
	check("email")
		.not()
		.isEmpty()
		.isEmail()
		.withMessage("Input a valid email address"),
];

exports.isEmailValidator = (value) => {
	const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	if (value.match(emailFormat)) {
		return true;
	} else {
		return false;
	}
};

exports.resetPasswordValidator = [
	check("password")
		.not()
		.isEmpty()
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
];

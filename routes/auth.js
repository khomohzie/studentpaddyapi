const express = require("express");

const router = express.Router();

const {
	preRegister,
	register,
	signin,
	forgotPassword,
	resetPassword,
	requireSignin,
	signout,
} = require("../controllers/auth.controller");

const { runValidation } = require("../validators");
const {
	userSignupValidator,
	userSigninValidator,
	resetPasswordValidator,
} = require("../validators/auth");

router.post(
	"/auth/account-activation",
	userSignupValidator,
	runValidation,
	preRegister
);
router.post("/auth/signup", userSignupValidator, runValidation, register);
router.post("/auth/login", userSigninValidator, runValidation, signin);
router.get("/auth/signout", requireSignin, signout);
router.post("/auth/forgot_password", forgotPassword);
router.post(
	"/auth/reset_password",
	resetPasswordValidator,
	runValidation,
	resetPassword
);

module.exports = router;

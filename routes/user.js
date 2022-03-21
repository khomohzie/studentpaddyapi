const express = require("express");

const router = express.Router();

const {
	userProfile,
	deleteAccount,
	updateAccount,
	changePassword,
	profileSetup,
} = require("../controllers/user.controller");

const { requireSignin } = require("../controllers/auth.controller");
const { runValidation } = require("../validators/index");
const { resetPasswordValidator } = require("../validators/auth");
const { profileSetupValidator } = require("../validators/user");
const multerUpload = require("../middlewares/multer");

router.get("/profile/:id", userProfile);
router.delete("/user/me", requireSignin, deleteAccount);
router.put("/user/me", requireSignin, multerUpload, updateAccount);
router.patch(
	"/user/update",
	requireSignin,
	multerUpload,
	profileSetupValidator,
	profileSetup
);
router.patch(
	"/change-password",
	requireSignin,
	resetPasswordValidator,
	runValidation,
	changePassword
);

module.exports = router;

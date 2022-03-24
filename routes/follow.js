const express = require("express");

const {
	followUser,
	unFollowUser,
	getFollowers,
	getFollowings,
} = require("../controllers/follow.controller");

const { requireSignin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/user/follow/:username", requireSignin, followUser);
router.delete("/user/unfollow/:username", requireSignin, unFollowUser);
router.get("/user/followers/:id", requireSignin, getFollowers);
router.get("/user/followings/:id", requireSignin, getFollowings);

module.exports = router;

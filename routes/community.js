const express = require("express");

const router = express.Router();

const {
	create,
	getAll,
	readCommunity,
	followCommunity,
	unFollowCommunity,
	getTopics,
} = require("../controllers/community.controller");

const { requireSignin } = require("../controllers/auth.controller");

const multerUpload = require("../middlewares/multer");

router.post("/community", requireSignin, multerUpload, create);
router.get("/communities", getAll);
router.get("/community/:id", readCommunity);
router.post("/community/follow/:id", requireSignin, followCommunity);
router.post("/community/unfollow/:id", requireSignin, unFollowCommunity);
router.get("/community/topics/:id", requireSignin, getTopics);

module.exports = router;

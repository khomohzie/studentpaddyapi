const express = require("express");

const router = express.Router();

const {
	create,
	getAll,
	readCommunity,
	followCommunity,
	unFollowCommunity,
} = require("../controllers/community.controller");

const { requireSignin } = require("../controllers/auth.controller");

const multerUpload = require("../middlewares/multer");

router.post("/community", requireSignin, multerUpload, create);
router.get("/communities", getAll);
router.get("/community/:name", readCommunity);
router.post("/community/follow/:id", requireSignin, followCommunity);
router.post("/community/unfollow/:id", requireSignin, unFollowCommunity);

module.exports = router;

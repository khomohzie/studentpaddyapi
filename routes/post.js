const express = require("express");

const router = express.Router();

const {
	create,
	getAll,
	readPost,
	communityData,
} = require("../controllers/post.controller");

const { requireSignin } = require("../controllers/auth.controller");

const multerUpload = require("../middlewares/multer");

router.post("/post", requireSignin, multerUpload, create);
router.get("/posts", getAll);
router.get("/post/:id", requireSignin, readPost);
router.get("/posts/:communityId", requireSignin, communityData);

module.exports = router;

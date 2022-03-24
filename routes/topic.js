const express = require("express");

const router = express.Router();

const {
	create,
	getAll,
	readTopic,
	followTopic,
	unFollowTopic,
} = require("../controllers/topic.controller");

const { requireSignin } = require("../controllers/auth.controller");

router.post("/topic", requireSignin, create);
router.get("/topics", getAll);
router.get("/topic/:name", readTopic);
router.post("/topic/follow/:id", requireSignin, followTopic);
router.post("/topic/unfollow/:id", requireSignin, unFollowTopic);

module.exports = router;

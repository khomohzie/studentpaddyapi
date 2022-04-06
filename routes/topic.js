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
router.get("/topic/:id", readTopic);
router.put("/topic/follow/:id", requireSignin, followTopic);
router.put("/topic/unfollow/:id", requireSignin, unFollowTopic);

module.exports = router;

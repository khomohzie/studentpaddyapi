const express = require("express");

const router = express.Router();

const { requireSignin } = require("../controllers/auth.controller");

const {
	getResources,
	getUnansweredQuestions,
	getAnsweredQuestions,
} = require("../controllers/resource_question.controller");

// route for advanced query on resources(files, links) and questions
router.get("/resources", requireSignin, getResources);
router.get("/questions/answered", requireSignin, getAnsweredQuestions);
router.get("/questions/unanswered", requireSignin, getUnansweredQuestions);

module.exports = router;

const express = require("express");

const router = express.Router();

const { create } = require("../controllers/post.controller");

const { requireSignin } = require("../controllers/auth.controller");

const multerUpload = require("../middlewares/multer");

router.post("/post", requireSignin, multerUpload, create);

module.exports = router;

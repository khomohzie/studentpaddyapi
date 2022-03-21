require("dotenv").config({ path: "config.env" });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev"));
// cors
// if (process.env.NODE_ENV !== "production")
// 	app.use(cors({ origin: process.env.CLIENT_URL }));

// routes
readdirSync("./routes").map((fileName) => {
	app.use("/api", require(`./routes/${fileName}`));
});

module.exports = app;

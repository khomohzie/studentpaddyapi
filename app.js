require("dotenv").config({ path: "config.env" });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
const path = require("path");

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

app.get("/", (req, res) => {
	res.sendFile(path.join(`${__dirname}/index.html`));
});

module.exports = app;

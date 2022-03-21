const app = require("./app");
const { exit } = require("process");
const { connectDB } = require("./config/db");

const port = process.env.PORT || 4000;

let server;

// Connect to database and start the server
connectDB()
	.then(() => {
		server = app.listen(port, () =>
			console.log(`Server listening on port ${port}`)
		);
	})
	.catch(() => {
		console.log("Database connection failed!");
	});

process.on("unhandledRejection", (error) => {
	console.log("UNHANDLED REJECTION! Shutting down...");
	console.log(error);
	console.log(error.name, error.message);

	server.close(() => exit(1));
});

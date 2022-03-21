const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		firstname: {
			type: String,
		},
		lastname: {
			type: String,
		},
		country: {
			type: String,
			required: true,
		},
		about: {
			type: String,
			maxlength: 250,
		},
		skills: {
			type: [String],
			required: true,
		},
		institution: {
			type: String,
		},
		faculty: {
			type: String,
		},
		department: {
			type: String,
		},
		academic_status: {
			type: String,
		},
		year_of_graduation: {
			type: String,
		},
		photo: {
			type: String,
			default: "/avatar.png",
		},
		cover_photo: {
			type: String,
		},
		message_permission: {
			type: Boolean,
			default: true,
		},
		reset_password_pin: {
			type: String,
			default: "",
		},
		reset_pin_expiry: {
			type: Date,
		},
		privacy_setting: {},
		notification_setting: {},
	},
	{ timestamps: true }
);

userSchema.methods = {
	encryptPassword: function (enteredPassword) {
		if (enteredPassword.length >= 6) {
			this.salt = crypto.randomBytes(16).toString("hex");
			this.password = crypto
				.pbkdf2Sync(enteredPassword, this.salt, 10000, 64, "sha512")
				.toString("hex");
		} else {
			throw new Error("Password must be at least 6 characters");
		}
	},

	authenticatePassword: function (enteredPassword) {
		return (
			this.password ===
			crypto
				.pbkdf2Sync(enteredPassword, this.salt, 10000, 64, "sha512")
				.toString("hex")
		);
	},
};

module.exports = mongoose.model("User", userSchema);

// Import the functions you need from the SDKs you need
const firebase = require("firebase/app");

// Your web app's Firebase configuration
const { firebaseConfig } = require("./firebase.config");

// Initialize Firebase
module.exports =
	firebase.getApps().length < 1
		? firebase.initializeApp(firebaseConfig)
		: firebase.getApp();

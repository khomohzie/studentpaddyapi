const firebase = require("../config/firebase.db");
const storage = require("firebase/storage");

const myStorage = storage.getStorage(firebase);

exports.firebaseUpload = async (file) => {
	try {
		// Add Image to Storage and return the file path
		// Grab the file
		const imgFile = file;

		// Format the filename
		const timestamp = Date.now();
		const name = imgFile.originalname.split(".")[0];
		const type = imgFile.originalname.split(".")[1];

		const fileName = `${name}_${timestamp}.${type}`;

		// Create a URL and return the storage reference
		const newPhotoRef = storage.ref(myStorage, fileName);

		await storage.uploadBytes(
			newPhotoRef,
			imgFile.buffer,
			imgFile.mimetype
		);

		const downloadURL = await storage.getDownloadURL(newPhotoRef);

		return downloadURL;
	} catch (err) {
		console.error(err);
		return [err, "Failed to upload to firebase!"];
	}
};

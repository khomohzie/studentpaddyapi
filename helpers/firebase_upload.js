const firebase = require("../config/firebase.db");
const {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
} = require("firebase/storage");

const storage = getStorage(firebase);

storage.maxUploadRetryTime = 30000;

exports.firebaseUpload = (file) => {
	return new Promise((resolve, reject) => {
		// Add Image to Storage and return the file path
		// Grab the file
		const imgFile = file;

		// Format the filename
		const timestamp = Date.now();
		const name = imgFile.originalname.split(".")[0];
		const type = imgFile.originalname.split(".")[1];

		const fileName = `${name}_${timestamp}.${type}`;

		// Create a URL and return the storage reference
		const storageRef = ref(storage, fileName);

		const uploadTask = uploadBytesResumable(
			storageRef,
			imgFile.buffer,
			imgFile.mimetype
		);

		/** Register three observers:
		 * 1. 'state_changed' observer, called any time the state changes
		 * 2. Error observer, called on failure
		 * 3. Completion observer, called on successful completion
		 */

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				// Observe state change events such as progress, pause, and resume
				// Get task progress, number of bytes uploaded/total number of bytes to be uploaded
				const progress =
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log(`Upload is ${progress}% done`);

				switch (snapshot.state) {
					case "paused":
						console.log("Upload is paused");
						break;
					case "running":
						console.log("Upload is running");
						break;
				}
			},
			(error) => {
				switch (error.code) {
					case "storage/retry-limit-exceeded":
						reject(
							"Maximum time limit exceeded. Try uploading again."
						);
					case "storage/unauthorized":
						reject(
							"User doesn't have permission to access the object"
						);
					case "storage/canceled":
						reject("User canceled the upload");
					case "storage/unknown":
						reject(
							"Unknown error occurred, inspect error.serverResponse"
						);
				}
			},
			() => {
				// Upload completed successfully, now we can get the download URL
				getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					resolve(downloadURL);
				});
			}
		);
	});
};

const fs = require("fs");
const path = require("path");

// Path to the uploads directory
const uploadsFolder = path.join(__dirname, "./uploads");

// Function to clear all files in the uploads folder
const clearUploadsFolder = () => {
  fs.readdir(uploadsFolder, (err, files) => {
    if (err) {
      console.error("Error reading uploads folder:", err.message);
      return;
    }

    // Loop through each file and delete it
    files.forEach((file) => {
      const filePath = path.join(uploadsFolder, file);

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Error deleting file ${file}:`, unlinkErr.message);
        } else {
          console.log(`Deleted file: ${file}`);
        }
      });
    });
  });
};

// Call the function
clearUploadsFolder();

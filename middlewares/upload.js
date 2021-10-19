const multer = require("multer");
const path = require("path");
const fs = require('fs')

// storage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

module.exports = storage;

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000000
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "profile") {
          if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
          ) {
            cb(null, true);
          } else {
            cb(new Error("Only .jpg, .png or .jpeg format allowed!"));
          }
        }  else {
          cb(new Error("There was an unknown error!"));
        }
      },

})

module.exports = upload;
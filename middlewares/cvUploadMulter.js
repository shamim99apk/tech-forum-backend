const multer = require("multer");
const path = require("path");
const fs = require('fs')

// storage engine
const storage = multer.diskStorage({
    destination: './upload/cv',
    filename: (req, file, cb) => {
        console.log('9', file)
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

module.exports = storage;

const cvUploadMulter = multer({
    storage: storage,
    limits: {
        fileSize: 100000000
    },
    fileFilter: (req, file, cb) => {
       if (file.fieldname === "cv") {
          if (file.mimetype === "application/pdf") {
            cb(null, true);
          } else {
            cb(new Error("Only .pdf format allowed!"));
          }
        } else {
          cb(new Error("There was an unknown error!"));
        }
      },
})

module.exports = cvUploadMulter;
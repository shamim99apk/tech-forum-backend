const multer = require("multer");


module.exports = {

    errorHandleUpload: (err, req, res, next) => {
        if (err) {

            if (err instanceof multer.MulterError) {

                return res.status(500).json({
                    message: 'There was an upload error!'
                })
            } else {
                // res.status(500).send(err.message);
                return res.status(500).json({
                    message: err.message
                })
            }

        } else {
            res.send("success");
        }
    }



}
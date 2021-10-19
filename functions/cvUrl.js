module.exports = {
    cvUrl: (req, cvPath) => {

        let cv_url

        if (cvPath === null) {
            cv_url = null
        } else {
            const profileSplit = cvPath.split("/")
            const fileName = profileSplit[2]
            cv_url = req.protocol + '://' + req.get('host') + '/' + 'cv' + '/' + fileName
        }//else

        return cv_url;

    }
}
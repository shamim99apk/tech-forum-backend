// -------------------------IMPORTING-------------------------
const express = require('express')

const {
    addUserJobInfo,
    addUserJobInfoUpdate,
    addUserJobInfoDelete,
    addUserJobInfoDetails
} = require('../controllers/jobInformationController')


const {authVerify} = require('../middlewares/auth')


// -------------------------DEFINE ROUTER-------------------------
const router = express.Router()

// -------------------------CUSTOM ROUTE-------------------------
router.post('/job-information',
authVerify,
addUserJobInfo
)//end
router.put('/job-information',
authVerify,
addUserJobInfoUpdate
)//end
router.get('/job-information',
authVerify,
addUserJobInfoDetails
)//end
router.delete('/job-information',
authVerify,
addUserJobInfoDelete
)//end




// -------------------------EXPORT ROUTER-------------------------
module.exports = router



// -------------------------IMPORTING-------------------------
const express = require('express')

const {
    addTrainingInfo,
    trainingInfoUpdate,
    trainingInfoDelete,
    trainingInfoDetails
} = require('../controllers/trainingInformationController')




const {authVerify} = require('../middlewares/auth')


// -------------------------DEFINE ROUTER-------------------------
const router = express.Router()

// -------------------------CUSTOM ROUTE-------------------------
router.post('/training-information',
authVerify,
addTrainingInfo
)//end
router.put('/training-information',
authVerify,
trainingInfoUpdate
)//end
router.get('/training-information',
authVerify,
trainingInfoDetails
)//end
router.delete('/training-information',
authVerify,
trainingInfoDelete
)//end




// -------------------------EXPORT ROUTER-------------------------
module.exports = router



// -------------------------IMPORTING-------------------------
const express = require('express')

const {
    addAcademicInformation,
    academeicInformationUpdate,
    academeicInformationDelete,
    academeicInformationDetails
} = require('../controllers/academicController')



const {authVerify} = require('../middlewares/auth')


// -------------------------DEFINE ROUTER-------------------------
const router = express.Router()

// -------------------------CUSTOM ROUTE-------------------------
router.post('/academeic-information',
authVerify,
addAcademicInformation
)//end
router.put('/academeic-information',
authVerify,
academeicInformationUpdate
)//end
router.get('/academeic-information',
authVerify,
academeicInformationDetails
)//end
router.delete('/academeic-information',
authVerify,
academeicInformationDelete
)//end




// -------------------------EXPORT ROUTER-------------------------
module.exports = router



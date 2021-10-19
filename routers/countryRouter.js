// -------------------------IMPORTING-------------------------
const express = require('express')

const {
    countryList,
} = require('../controllers/countryController')





// -------------------------DEFINE ROUTER-------------------------
const router = express.Router()

// -------------------------CUSTOM ROUTE-------------------------

router.get('/country-list',
countryList
)//end




// -------------------------EXPORT ROUTER-------------------------
module.exports = router



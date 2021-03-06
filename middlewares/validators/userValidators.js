// ---------------------------------IMPORTING---------------------------------
const { check } = require('express-validator');

module.exports = {
    signUpValidator: [
        check('userName')
            .trim()
            .not()
            .isEmpty()
            .withMessage('userName name is required!')
            .isString()
            .withMessage('userName name must be string!')
            .isLength({ min: 3, max: 50 })
            .withMessage('userName name must be 3 to 50 characters'),

        check('email')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Email is required!')
            .isEmail()
            .withMessage('Please provide a valid email address'),

        check('password')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Password is required!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),
    ], //end
    signInValidator: [
        check('email')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Email is required!')
            .isEmail()
            .withMessage('Please provide a valid email address'),

        check('password')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Password is required!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),
    ], //end
    profileValidator: [
        check('firstName')
            .trim()
            .not()
            .isEmpty()
            .withMessage('First name is required!')
            .isString()
            .withMessage('First name must be string!')
            .isLength({ min: 3, max: 50 })
            .withMessage('First name must be 3 to 50 characters'),

        check('lastName')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Last name is required!')
            .isLength({ min: 3, max: 50 })
            .withMessage('Last name must be 3 to 50 characters'),

        check('phoneNo')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Phone Number is required!')
            .isMobilePhone()
            .withMessage('Please provide a valid phone number address'),

        check('about')
            .trim()
            .not()
            .isEmpty()
            .withMessage('about is required!')
            .isString()
            .withMessage('about must be string!')
            .isLength({ min: 3, max: 110 })
            .withMessage('About must be 3 to 110 characters'),
    ], //end
    passwordValidator: [
        check('password')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Password is required!')
            .isString()
            .withMessage('password name must be string!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),
    ], //end
    passwordUpdate: [
        check('oldPassword')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Password is required!'),

        check('newPassword')
            .trim()
            .not()
            .isEmpty()
            .withMessage('newPassword is required!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),

        check('conformPassword')
            .trim()
            .not()
            .isEmpty()
            .withMessage('conformPassword is required!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),
    ],
    forgotPasswordValidation: [
        check('forgotCode')
            .trim()
            .not()
            .isEmpty()
            .withMessage('forgotCode is required!')
            .isLength({ min: 6, max: 6 })
            .withMessage('forgotCode must be  6 characters'),

        check('newPassword')
            .trim()
            .not()
            .isEmpty()
            .withMessage('newPassword is required!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),

        check('conformPassword')
            .trim()
            .not()
            .isEmpty()
            .withMessage('conformPassword is required!')
            .isLength({ min: 8 })
            .withMessage('Password must be minimum 8 characters'),
    ],
};

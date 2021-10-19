// ---------------------------------IMPORTING---------------------------------
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models').User;
const Role = require('../models').Role;
const Academic_info = require('../models').User_academic_info;
const User_training_info = require('../models').User_training_info;
const User_job_info = require('../models').User_job_info;
const { Op } = require('sequelize');
const imageUrlProcess = require('../functions/imageUrl');
const cvUrlProcess = require('../functions/cvUrl');
const users = require('../functions/response');
const { emailSending } = require('../functions/emailSending');
const { OTPSending } = require('../functions/OTPsending');
const token = require('../functions/uuidGenerator');
const randomOTP = require('../functions/otpGenerator');
const fetch = require('node-fetch');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(
    '64229136387-ijqj7gpgfqriqje4cr77hm4latvgp2ag.apps.googleusercontent.com'
);
const axios = require('axios');
const querystring = require('query-string');

// ---------------------------------CONTROLLERS---------------------------------

module.exports = {
    otp: async (req, res) => {
        let { email } = req.body;
        let d = new Date();

        User.findOne({ where: { email: email } }).then(async (user) => {
            if (user) {
                let otp = randomOTP.generate(6);
                if (user.forgotCode === otp) {
                    await user.update({
                        forgotCode: null,
                        forgotCodeDateTime: null,
                    });
                    otp = randomOTP.generate(6);
                }
                await user.update({ forgotCode: otp, forgotCodeDateTime: d });

                await OTPSending(email, otp);
                return res.status(201).json({
                    message: 'OTP sending successfully',
                });
            } else {
                return res.status(422).json({
                    message: 'You are not registered user!!!',
                });
            }
        });
    },
    forgotPassword: async (req, res) => {
        // let {forgotCode, newPassword, conformPassword} = req.body
        let { forgotCode, newPassword, conformPassword } = req.body;
        let password, hash;

        // console.log('45',req)
        var startTime = new Date();
        var endTime = new Date();
        var difference = endTime.getTime() - startTime.getTime();
        var resultInMinutes = Math.round(difference / 60000);

        if (newPassword !== conformPassword) {
            return res.status(400).json({
                error: 'No match found password',
            });
        }

        password = conformPassword;
        hash = bcrypt.hashSync(password, 10);

        User.findOne({
            where: {
                [Op.and]: { forgotCode: forgotCode },
            },
        })
            .then((user) => {
                var difference = startTime.getTime() - user.forgotCodeDateTime;
                var resultInMinutes = Math.round(difference / 60000);

                if (resultInMinutes > 5) {
                    return res.status(401).json({
                        message: 'Otp send time out, Please try again',
                    });
                }
                user.update({
                    password: hash,
                    forgotCode: null,
                    forgotCodeDateTime: null,
                }).then(() => {
                    return res.status(201).json({
                        message: 'Password updated successfully',
                    });
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    error,
                });
            });
    },
    signUp: (req, res) => {
        const verifyToken = token.uuidGenerator();
        // const verifyToken = null
        let { userName, email, password } = req.body;
        let hash = bcrypt.hashSync(password, 10); // synchronous hashing

        User.findOne({
            where: {
                [Op.or]: [{ userName: userName }, { email: email }],
            },
        })
            .then((user) => {
                if (user) {
                    return res.status(406).json({
                        success: false,
                        error: 'This email or userName is already in use, try sign-in',
                    });
                } else {
                    User.create({
                        userName,
                        email,
                        password: hash,
                        verifyToken: verifyToken,
                    }).then(async (user) => {
                        emailSending(email, verifyToken);
                        await Role.findAll({
                            where: { defaultGroup: true },
                        }).then((role) => {
                            if (role.length > 1) {
                                return res.status(500).json({
                                    message: 'Internal server error',
                                });
                            } else {
                                user.setRoles(role);
                                return res.status(201).json({
                                    data: users.responseData(user),
                                    'default-Role': role,
                                });
                            }
                        });
                    });
                }
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    }, //end signUp
    verification: (req, res) => {
        const token = req.params.id;

        User.findOne({
            where: {
                [Op.and]: { verifyToken: token, emailVerification: false },
            },
        })
            .then((user) => {
                user.update({
                    verifyToken: null,
                    emailVerification: true,
                }).then((verify) => {
                    return res.status(201).json({
                        verification: true,
                    });
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    message: 'No verification found',
                });
            });
    }, //end verification
    signIn: (req, res) => {
        // [Op.and]: {email: email, banned: false, emailVerification: true, verifyToken: null}
        const { email, password } = req.body;

        User.findOne({
            where: {
                // [Op.and]: {email: email, banned: false}
                [Op.and]: {
                    email: email,
                    banned: false,
                    emailVerification: true,
                    verifyToken: null,
                },
            },
            include: {
                model: Role,
            },
        })
            .then((user) => {
                if (!user) {
                    return res.status(401).json({
                        message: 'You are not able to login',
                    });
                } //if

                if (user) {
                    if (bcrypt.compareSync(password, user.password)) {
                        const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
                        const imagePath = user.dataValues.profile;
                        const imageUrl = imageUrlProcess.imageUrl(
                            req,
                            imagePath
                        );
                        const data = {
                            users: users.responseData(user),
                            imageUrl: imageUrl,
                            is_superAdmin: user.dataValues.is_superAdmin,
                            Roles: user.dataValues.Roles,
                        };

                        const token = jwt.sign(data, SECRET_KEY, {
                            expiresIn: '5d',
                        });

                        return res.status(200).json({
                            data: {
                                message: 'login success',
                                token: 'Bearer ' + token,
                            },
                        });
                    } //if
                    else {
                        return res.status(401).json({
                            data: {
                                message: 'Password not matches!',
                            },
                        });
                    }
                } //if
                else {
                    return res.status(401).json({
                        data: {
                            message: 'Email address not found',
                        },
                    });
                }
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    }, //end signIn

    // facebook login
    facebookLogin: (req, res) => {
        const { userID, accessToken } = req.body;
        console.log('251', userID, accessToken);
        let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

        fetch(urlGraphFacebook, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((response) => {
                const { email, id } = response;

                User.findOne({
                    where: {
                        [Op.and]: {
                            email: email,
                            banned: false,
                            emailVerification: true,
                            verifyToken: null,
                        },
                    },
                    include: {
                        model: Role,
                    },
                })
                    .then((user) => {
                        if (!user) {
                            let password =
                                email + process.env.ACCESS_TOKEN_SECRET;
                            let userName = id;
                            let sna = 'FB';
                            let hash = bcrypt.hashSync(password, 10); // synchronous hashing

                            User.findOne({
                                where: {
                                    [Op.or]: [
                                        { userName: userName },
                                        { email: email },
                                    ],
                                },
                            })
                                .then((user) => {
                                    if (user) {
                                        return res.status(406).json({
                                            success: false,
                                            error: 'This email and username already in used, please try again',
                                        });
                                    } else {
                                        User.create({
                                            email,
                                            userName,
                                            password: hash,
                                            verifyToken: null,
                                            emailVerification: true,
                                            sna: sna,
                                        }).then(async (user) => {
                                            await Role.findAll({
                                                where: { defaultGroup: true },
                                            }).then((role) => {
                                                if (role.length > 1) {
                                                    return res
                                                        .status(500)
                                                        .json({
                                                            message:
                                                                'Internal server error',
                                                        });
                                                } else {
                                                    user.setRoles(role);
                                                    return res
                                                        .status(201)
                                                        .json({
                                                            data: users.responseData(
                                                                user
                                                            ),
                                                            'default-Role':
                                                                role,
                                                        });
                                                }
                                            });
                                        });
                                    }
                                })
                                .catch((error) => {
                                    return res.status(400).json({ error });
                                });
                        } else {
                            if (user) {
                                const SECRET_KEY =
                                    process.env.ACCESS_TOKEN_SECRET;
                                const imagePath = user.dataValues.profile;
                                const imageUrl = imageUrlProcess.imageUrl(
                                    req,
                                    imagePath
                                );
                                const data = {
                                    users: users.responseData(user),
                                    imageUrl: imageUrl,
                                    is_superAdmin:
                                        user.dataValues.is_superAdmin,
                                    Roles: user.dataValues.Roles,
                                };
                                console.log('user 349', data);
                                const token = jwt.sign(data, SECRET_KEY, {
                                    expiresIn: '2d',
                                });

                                return res.status(200).json({
                                    data: {
                                        message: 'Login successfull',
                                        token: 'Bearer ' + token,
                                    },
                                });
                            } //if
                            else {
                                return res.status(401).json({
                                    data: {
                                        message: 'Email address not found',
                                    },
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        return res.status(400).json({ error });
                    });
            });
    },

    // google login implementation
    googleLogin: (req, res) => {
        const { tokenId } = req.body;

        client
            .verifyIdToken({
                idToken: tokenId,
                audience:
                    '64229136387-ijqj7gpgfqriqje4cr77hm4latvgp2ag.apps.googleusercontent.com',
            })
            .then((response) => {
                const { email_verified, name, email, sub } = response.payload;
                console.log('payload', response.payload);
                if (email_verified) {
                    console.log('386', email_verified);
                    User.findOne({
                        where: {
                            [Op.and]: {
                                email: email,
                                banned: false,
                                emailVerification: true,
                                verifyToken: null,
                            },
                        },
                        include: {
                            model: Role,
                        },
                    })
                        .then((user) => {
                            console.log('397', sub);
                            if (!user) {
                                console.log('399', user);

                                let password =
                                    email + process.env.ACCESS_TOKEN_SECRET;
                                let userName = sub;
                                let sna = 'GA';
                                let hash = bcrypt.hashSync(password, 10); // synchronous hashing

                                User.findOne({
                                    where: {
                                        [Op.or]: [
                                            { userName: userName },
                                            { email: email },
                                        ],
                                    },
                                })
                                    .then((user) => {
                                        if (user) {
                                            return res.status(406).json({
                                                success: false,
                                                error: 'This email and username already in used, please try again',
                                            });
                                        } else {
                                            User.create({
                                                email,
                                                userName,
                                                password: hash,
                                                verifyToken: null,
                                                emailVerification: true,
                                                sna: sna,
                                            }).then(async (user) => {
                                                await Role.findAll({
                                                    where: {
                                                        defaultGroup: true,
                                                    },
                                                }).then((role) => {
                                                    if (role.length > 1) {
                                                        return res
                                                            .status(500)
                                                            .json({
                                                                message:
                                                                    'Internal server error',
                                                            });
                                                    } else {
                                                        user.setRoles(role);
                                                        return res
                                                            .status(201)
                                                            .json({
                                                                data: users.responseData(
                                                                    user
                                                                ),
                                                                'default-Role':
                                                                    role,
                                                            });
                                                    }
                                                });
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        return res.status(400).json({ error });
                                    });
                            } else {
                                if (user) {
                                    const SECRET_KEY =
                                        process.env.ACCESS_TOKEN_SECRET;
                                    const imagePath = user.dataValues.profile;
                                    const imageUrl = imageUrlProcess.imageUrl(
                                        req,
                                        imagePath
                                    );
                                    const data = {
                                        users: users.responseData(user),
                                        imageUrl: imageUrl,
                                        is_superAdmin:
                                            user.dataValues.is_superAdmin,
                                        Roles: user.dataValues.Roles,
                                    };
                                    console.log('user 349', data);
                                    const token = jwt.sign(data, SECRET_KEY, {
                                        expiresIn: '2d',
                                    });

                                    return res.status(200).json({
                                        data: {
                                            message: 'Login successfull',
                                            token: 'Bearer ' + token,
                                        },
                                    });
                                } //if
                                else {
                                    return res.status(401).json({
                                        data: {
                                            message: 'Email address not found',
                                        },
                                    });
                                }
                            }
                        })
                        .catch((error) => {
                            return res.status(400).json({ error });
                        });
                }
            });
    },

    githubLogin: async (req, res) => {
        const { code } = req.body;
        let clientID = '0501a80e0f3492ff592d';
        let clientSecret = '099fb8dbb91866770827c63466459e868361f88e';
        console.log('505', code);
        let accessToken;
        await axios
            .post(
                `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`
            )
            .then((response) => {
                console.log('516', response.data);
                const decoded = querystring.parse(response.data);

                accessToken = decoded.access_token;
                console.log('520', accessToken);
            })
            .catch((error) => {
                throw error;
            });

        // console.log('519',githubToken)

        // const decoded = querystring.parse(githubToken);

        // const accessToken = decoded.access_token;
        // console.log('526',accessToken)
        return axios
            .get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            .then((response) => {
                console.log('531', response.data, response.data.email);
                let email = response.data.email;
                let id = response.data.id;
                console.log('id 543', id);
                if (email) {
                    // console.log('543',email)
                    User.findOne({
                        where: {
                            [Op.and]: {
                                email: email,
                                banned: false,
                                emailVerification: true,
                                verifyToken: null,
                            },
                        },
                        include: {
                            model: Role,
                        },
                    })
                        .then((user) => {
                            if (!user) {
                                let password =
                                    email + process.env.ACCESS_TOKEN_SECRET;
                                let userName = id;
                                let sna = 'GH';
                                let hash = bcrypt.hashSync(password, 10); // synchronous hashing
                                console.log('564', userName, email);

                                User.findOne({
                                    where: {
                                        [Op.or]: [{ email: email }],
                                    },
                                })
                                    .then((user) => {
                                        console.log('574');
                                        if (user) {
                                            return res.status(406).json({
                                                success: false,
                                                error: 'This email and username already in used, please try again',
                                            });
                                        } else {
                                            console.log('581');
                                            User.create({
                                                email,
                                                userName,
                                                password: hash,
                                                verifyToken: null,
                                                emailVerification: true,
                                                sna: sna,
                                            }).then(async (user) => {
                                                await Role.findAll({
                                                    where: {
                                                        defaultGroup: true,
                                                    },
                                                }).then((role) => {
                                                    if (role.length > 1) {
                                                        return res
                                                            .status(500)
                                                            .json({
                                                                message:
                                                                    'Internal server error',
                                                            });
                                                    } else {
                                                        user.setRoles(role);
                                                        return res
                                                            .status(201)
                                                            .json({
                                                                data: users.responseData(
                                                                    user
                                                                ),
                                                                'default-Role':
                                                                    role,
                                                            });
                                                    }
                                                });
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        return res.status(400).json({ error });
                                    });
                            } else {
                                if (user) {
                                    const SECRET_KEY =
                                        process.env.ACCESS_TOKEN_SECRET;
                                    const imagePath = user.dataValues.profile;
                                    const imageUrl = imageUrlProcess.imageUrl(
                                        req,
                                        imagePath
                                    );
                                    const data = {
                                        users: users.responseData(user),
                                        imageUrl: imageUrl,
                                        is_superAdmin:
                                            user.dataValues.is_superAdmin,
                                        Roles: user.dataValues.Roles,
                                    };
                                    console.log('user 349', data);
                                    const token = jwt.sign(data, SECRET_KEY, {
                                        expiresIn: '2d',
                                    });

                                    return res.status(200).json({
                                        data: {
                                            message: 'Login successfull',
                                            token: 'Bearer ' + token,
                                        },
                                    });
                                } //if
                                else {
                                    return res.status(401).json({
                                        data: {
                                            message: 'Email address not found',
                                        },
                                    });
                                }
                            }
                        })
                        .catch((error) => {
                            return res.status(400).json({ error });
                        });
                } else {
                    console.log('Please keep your github email public');
                }
            })
            .catch(() => {
                // console.error(`533 ,Error getting user from GitHub`);
                return res.status(400).json({
                    message: 'Error getting user from GitHub',
                });
            });
    },

    getProfile: (req, res) => {
        let id = req.user.users.id;

        User.findByPk(id, {
            include: [
                {
                    model: Academic_info,
                },
                {
                    model: User_job_info,
                },
                {
                    model: User_training_info,
                },

                {
                    model: Role,
                },
            ],
        })
            .then((user) => {
                const imagePath = user.dataValues.profile;
                const cvPath = user.dataValues.cv;
                const imageUrl = imageUrlProcess.imageUrl(req, imagePath);
                const cv_Url = imageUrlProcess.imageUrl(req, cvPath);

                return res.status(200).json({
                    users: users.responseData(user),
                    imageUrl: imageUrl,
                    cv_Url: cv_Url,
                    Roles: user.dataValues.Roles,
                    User_academic_info: user.dataValues.User_academic_infos,
                    User_job_info: user.dataValues.User_job_infos,
                    User_training_info: user.dataValues.User_training_infos,
                    // user
                });
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    }, //end getProfile
    profilePic: (req, res) => {
        let id = req.user.users.id;
        if (req.file) {
            const imagePath = 'upload/images' + '/' + req.file.filename;
            const imageUrl = imageUrlProcess.imageUrl(req, imagePath);

            User.findOne({
                where: { id: id },
            })
                .then((user) => {
                    user.update({
                        profile: imagePath,
                    }).then(() => {
                        return res.status(201).json({
                            profile: {
                                url: imageUrl,
                            },
                        });
                    });
                })
                .catch((error) => {
                    return res.status(400).json({ error });
                });
        } else {
            return res.status(400).json({
                message: 'No file upload available',
            });
        }
    }, //end profilePic
    profileUpdate: (req, res) => {
        let id = req.user.users.id;
        let status = 'active';
        let {
            firstName,
            lastName,
            phoneNo,
            about,
            social_information,
            website,
            gender,
            dob,
            bio,
        } = req.body;

        User.findOne({
            where: { id: id },
        })
            .then((user) => {
                user.update({
                    firstName,
                    lastName,
                    phoneNo,
                    about,
                    social_information,
                    website,
                    gender,
                    dob,
                    bio,
                    status,
                }).then((user) => {
                    const imagePath = user.dataValues.profile;
                    const imageUrl = imageUrlProcess.imageUrl(req, imagePath);
                    return res.status(202).json({
                        users: users.responseData(user),
                        imageUrl: imageUrl,
                    });
                });
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    }, //end profile

    // upload cv processing profile
    cvUpload: (req, res) => {
        let id = req.user.users.id;
        if (req.file) {
            // console.log('no found cv file')
            const cvPath = 'upload/cv' + '/' + req.file.filename;
            const url = cvUrlProcess.cvUrl(req, cvPath);

            User.findOne({
                where: { id: id },
            })
                .then((user) => {
                    user.update({
                        cv: cvPath,
                    }).then(() => {
                        return res.status(201).json({
                            cv: {
                                url: url,
                            },
                        });
                    });
                })
                .catch((error) => {
                    return res.status(400).json({
                        message: 'something went wrong file upload',
                    });
                });
        } else {
            return res.status(400).json({
                message: 'No file upload available',
            });
        }
    },
    updatePassword: (req, res) => {
        let id = req.user.users.id;
        let { oldPassword, newPassword, conformPassword } = req.body;

        if (newPassword === conformPassword) {
            User.findByPk(id)
                .then((user) => {
                    if (bcrypt.compareSync(oldPassword, user.password)) {
                        let hash = bcrypt.hashSync(conformPassword, 10);
                        user.update({
                            password: hash,
                        }).then(() => {
                            return res.status(202).json({
                                success: true,
                            });
                        });
                    } else {
                        return res.status(406).json({
                            success: false,
                            message: 'Old password wrong',
                        });
                    }
                })
                .catch((error) => {
                    return res.status(400).json({ error });
                });
        } else {
            return res.status(409).json({
                success: false,
                message: 'newPassword and conformPassword are different',
            });
        }
    }, //end updatePassword
    addGroups: (req, res) => {
        let { roles } = req.body;
        let id = req.params.id;

        User.findOne({
            where: { id: id },
        })
            .then((user) => {
                user.setRoles(roles);
                return res.status(201).json({
                    success: true,
                });
            })
            .catch((error) => {
                return res.status(400).json({ error: error });
            });
    }, //end addGroups
    bannedUser: (req, res) => {
        let { banned } = req.body;
        let id = req.params.id;

        User.findOne({
            where: { id: id },
        })
            .then((user) => {
                user.update({
                    banned,
                }).then(() => {
                    return res.status(202).json({
                        success: true,
                    }); //return
                });
            })
            .catch((error) => {
                return res.status(400).json({ error: error });
            });
    }, //end bannedUser
    deleteUser: (req, res) => {
        let id = req.user.users.id;

        User.destroy({
            where: { id: id },
        })
            .then(() => {
                return res.status(200).json({
                    success: true,
                }); //return
            })
            .catch((error) => {
                return res.status(400).json({ error: error });
            });
    }, //end deleteUser
    getUser: (req, res) => {
        let id = req.params.id;
        User.findByPk(id, {
            include: { model: Role },
        })
            .then((user) => {
                const imagePath = user.dataValues.profile;
                const imageUrl = imageUrlProcess.imageUrl(req, imagePath);

                return res.status(200).json({
                    users: users.responseData(user),
                    imageUrl: imageUrl,
                    is_superAdmin: user.dataValues.is_superAdmin,
                    banned: user.dataValues.banned,
                    Roles: user.dataValues.Roles,
                });
            })
            .catch((error) => {
                return res.status(400).json({ error: error });
            });
    }, //end getUsers
    updateUser: (req, res) => {
        let id = req.params.id;
        let {
            roles,
            userName,
            email,
            firstName,
            lastName,
            phoneNo,
            status,
            about,
            banned,
        } = req.body;

        User.findByPk(id, {
            include: { model: Role },
        })
            .then((user) => {
                user.setRoles(roles);
                user.update({
                    userName,
                    email,
                    firstName,
                    lastName,
                    phoneNo,
                    status,
                    about,
                    banned,
                }).then((user) => {
                    return res.status(202).json({
                        users: users.responseData(user),
                        is_superAdmin: user.dataValues.is_superAdmin,
                        banned: user.dataValues.banned,
                        Roles: user.dataValues.Roles,
                    });
                });
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    },
    userList: (req, res) => {
        let userName = req.query.userName;
        let email = req.query.email;
        // let group = req.query.group

        let page = parseInt(req.query.page);
        page = page ? page : 1;
        let limit = 10;
        let offset = page ? (page - 1) * limit : 0;

        let where = [];
        userName
            ? where.push({ userName: { [Op.like]: '%' + userName + '%' } })
            : !userName;
        email
            ? where.push({ email: { [Op.like]: '%' + email + '%' } })
            : !email;
        // group ? where.push({Roles: {[Op.contains]: [group]}}) : !group;

        User.findAndCountAll({
            offset: offset,
            limit: limit,
            where: where,
            attributes: {
                exclude: ['profile', 'password'],
            },
            include: { model: Role },
        })
            .then((users) => {
                const totalPage = Math.ceil(users.count / limit);
                return res.status(202).json({
                    pagination: {
                        current_page: page,
                        totalPage: totalPage,
                        total_users: users.count,
                        limit: limit,
                        offset: offset,
                    },
                    users: users.rows,
                });
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    }, //end userList
    latestUser: (req, res) => {
        User.findAll({
            attributes: [
                'id',
                'userName',
                'firstName',
                'lastName',
                'email',
                'phoneNo',
                'status',
                'about',
                'banned',
            ],
            limit: 5,
            order: [['id', 'DESC']],
        })
            .then((question) => {
                return res.status(200).json({
                    question,
                });
            })
            .catch((error) => {
                return res.status(400).json({ error });
            });
    }, //end latestUser.
};

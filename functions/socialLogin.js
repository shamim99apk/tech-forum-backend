const User = require('../models').User
const Role = require('../models').Role
const bcrypt = require('bcrypt')
const {Op} = require("sequelize")
const users = require('../functions/response')

module.exports = {
    socialLogin: (email, id) => {
        console.log('3',email,id);      
        let password = email+process.env.ACCESS_TOKEN_SECRET
        let userName = id
        let sna = 'fb'
        let hash = bcrypt.hashSync(password, 10)// synchronous hashing
   
        User.findOne({
            where: {
                [Op.or]: [
                    {userName: userName},
                    {email: email}
                ]
            }
        })
            .then(user => {

                if (user) {
                    return res.status(406).json({
                        success: false,
                        error: 'This email and username already in used, please try again'
                    })
                } else {
                  
                    User.create({
                        email,
                        userName,
                        password: hash,
                        verifyToken: null, 
                        emailVerification: true,
                        sna: sna
                    })
                        .then(async (user) => {
                         
                            await Role.findAll({
                                where: {defaultGroup: true}
                            })
                                .then(role => {
                                    if (role.length > 1) {
                                        return res.status(500).json({
                                            "message": "Internal server error",
                                        })
                                    } else {
                                        user.setRoles(role)
                                        return res.status(201).json({
                                            "data": users.responseData(user),
                                            "default-Role": role
                                        })
                                    }

                                })
                        })
                }

            }).catch(error => {
            return res.status(400).json({error})
        })
    }
}




// ---------------------------------IMPORTING---------------------------------
//jwt
const jwt = require('jsonwebtoken');


module.exports = {

    authVerify: (req, res, next) => {
        
        try {
             
            let header = req.headers['authorization']
           
            // console.log('13',header);
            let token = header.split(' ')
        
            const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
            // console.log('16',SECRET_KEY);
            jwt.verify(token[1], SECRET_KEY, function (err, decoded) {
                // console.log('18',req.user);
                if (!err) {
                    req.user = decoded
                    console.log('20',req.user);
                    next()
                }else {
                    return res.status(401).json({
                        "message": "The access token was worng and Session has expired on"
                    }) 
                }
            })

        } catch (e) {

            return res.status(403).json({
                "message": "Access Denied"
            })

        }

    }// authVerify
}
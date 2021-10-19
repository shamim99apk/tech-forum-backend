// ---------------------------------IMPORTING---------------------------------

const User = require('../models').User
const Academic_info = require('../models').User_academic_info
const {Op} = require("sequelize")




// ---------------------------------CONTROLLERS---------------------------------

module.exports = {

    addAcademicInformation: (req, res) => {
        let user_id = req.user.users.id
        const {degree_name,institution_name,passing_year} = req.body
    //    console.log('18', user_id)

       Academic_info.create({
        degree_name,
        institution_name,
        passing_year,
        user_id
    })
        .then(academic_info => {
            return res.status(201).json({
                academic_info
            })//return
        }).catch(error => {
        return res.status(400).json({error})
    })
  
       

    },

    academeicInformationUpdate: (req, res) => {
        let id = req.user.users.id
        const {degree_name,institution_name,passing_year} = req.body

        Academic_info.findOne({
            where: {
                [Op.and]: [
                    {id: id},
                    {user_id: id}
                ]
            }
        }).then( academic_info => {
            if (academic_info){
                academic_info.update({
                    degree_name,
                    institution_name,
                    passing_year,
                })
                .then((academic_info) => {
                    return res.status(202).json({
                        "message": "Academic infromation updated successfully",
                        academic_info
                    })
                })
            }else{
                return res.status(206).json({
                    "message": "Academic infromation not found"
                })
            }
        }).catch(error => {
            return res.status(400).json({
                "error": error
            })
        })
    },

    academeicInformationDetails:(req, res) => {
        let id = req.user.users.id

        User.findOne({
            where: {id:id},
            attributes: [],
            include: [
                {
                    model: Academic_info,
                },

            ]
        })
        .then((academic_info) => {
            return res.status(200).json({
                academic_info
            })
        }).catch(error => {
            return res.status(400).json({error})
        })
    },

    academeicInformationDelete : (req, res) => {
        let id = req.user.users.id

        Academic_info.destroy({
            where: {
                [Op.or]: [
                    {id: id},
                    {user_id: id}
                ]
            }
        }).then((academic_info) =>{
          if(academic_info) {
            return res.status(200).json({
                "message": "Academic information  deleted successfully"
            })
          }else {
            return res.status(404).json({
                "message": "Empty academic information found"
            })
          }
        }).catch(error =>{
            return res.status(400).json({error})
        })

    }

}

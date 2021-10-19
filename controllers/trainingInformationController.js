// ---------------------------------IMPORTING---------------------------------

const User = require('../models').User
const User_training_info = require('../models').User_training_info
const {Op} = require("sequelize")




// ---------------------------------CONTROLLERS---------------------------------

module.exports = {

    addTrainingInfo: (req, res) => {
        let user_id = req.user.users.id
        const {course_name,institue_name} = req.body
    //    console.log('18', user_id)

       User_training_info.create({
        course_name,
        institue_name,
        user_id
    })
        .then(User_training_info => {
            return res.status(201).json({
                User_training_info
            })//return
        }).catch(error => {
        return res.status(400).json({error})
    })
  
       

    },

    trainingInfoUpdate: (req, res) => {
        let id = req.user.users.id
        const {course_name,institue_name,} = req.body

        User_training_info.findOne({
            where: {
                [Op.and]: [
                    {id: id},
                    {user_id: id}
                ]
            }
        }).then( User_training_info => {
            if (User_training_info){
                User_training_info.update({
                    course_name,
                    institue_name,
                })
                .then((User_training_info) => {
                    return res.status(202).json({
                        "message": "Training infromation updated successfully",
                        User_training_info
                    })
                })
            }else{
                return res.status(206).json({
                    "message": "Training infromation not found"
                })
            }
        }).catch(error => {
            return res.status(400).json({
                "error": error
            })
        })
    },

    trainingInfoDetails:(req, res) => {
        let id = req.user.users.id

        User.findOne({
            where: {id:id},
            attributes: [],
            include: [
                {
                    model: User_training_info,
                },

            ]
        })
        .then((User_training_info) => {
            return res.status(200).json({
                User_training_info
            })
        }).catch(error => {
            return res.status(400).json({error})
        })
    },

    trainingInfoDelete : (req, res) => {
        let id = req.user.users.id

        User_training_info.destroy({
            where: {
                [Op.or]: [
                    {id: id},
                    {user_id: id}
                ]
            }
        }).then((User_training_info) =>{
          if(User_training_info) {
            return res.status(200).json({
                "message": "Training information  deleted successfully"
            })
          }else {
            return res.status(404).json({
                "message": "Empty training information found"
            })
          }
        }).catch(error =>{
            return res.status(400).json({error})
        })

    }

}

// ---------------------------------IMPORTING---------------------------------

const User = require('../models').User
const User_job_info = require('../models').User_job_info
const {Op} = require("sequelize")



// ---------------------------------CONTROLLERS---------------------------------

module.exports = {

    addUserJobInfo: (req, res) => {
        let user_id = req.user.users.id
        const {
            organization_name,
            position,duration,
            designation,
            responsibilities
        } = req.body
    //    console.log('18', user_id)

       User_job_info.create({
        organization_name,
        position,duration,
        designation,
        responsibilities,
        user_id
    })
        .then(User_job_info => {
            return res.status(201).json({
                User_job_info
            })//return
        }).catch(error => {
        return res.status(400).json({error})
    })
  
       

    },

    addUserJobInfoUpdate: (req, res) => {
        let id = req.user.users.id
        const { 
            organization_name,
            position,duration,
            designation,
            responsibilities
        } = req.body

        User_job_info.findOne({
            where: {
                [Op.and]: [
                    {id: id},
                    {user_id: id}
                ]
            }
        }).then( User_job_info => {
            if (User_job_info){
                User_job_info.update({
                    organization_name,
                    position,duration,
                    designation,
                    responsibilities
                })
                .then((User_job_info) => {
                    return res.status(202).json({
                        "message": "Job infromation updated successfully",
                        User_job_info
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

    addUserJobInfoDetails:(req, res) => {
        let id = req.user.users.id

        User.findOne({
            where: {id:id},
            attributes: [],
            include: [
                {
                    model: User_job_info,
                },

            ]
        })
        .then((User_job_info) => {
            return res.status(200).json({
                User_job_info
            })
        }).catch(error => {
            return res.status(400).json({error})
        })
    },

    addUserJobInfoDelete : (req, res) => {
        let id = req.user.users.id

        User_job_info.destroy({
            where: {
                [Op.or]: [
                    {id: id},
                    {user_id: id}
                ]
            }
        }).then((job_info) =>{
            if(job_info) {
                return res.status(200).json({
                    "message": "Job information  deleted successfully"
                })
              }else {
                return res.status(404).json({
                    "message": "Empty job information found"
                })
              }
        }).catch(error =>{
            return res.status(400).json({error})
        })

    }

}

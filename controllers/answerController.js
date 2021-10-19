// ---------------------------------IMPORTING---------------------------------
const Answer = require('../models').Answer
const Comment = require('../models').Comment
const Question = require('../models').Question
const Ansewer_log = require('../models').Ansewer_log
const { Op } = require("sequelize")
const db = require('../models/index')
const voteCounter = require('../functions/voteCount')

module.exports = {

    answer: (req, res) => {

        let { body, questionId } = req.body
        let respondentId = req.user.users.id
        let id = req.params.id

        //http://localhost:3000/api/answers [POST]
        if (req.method === "POST") {

            Answer.create({
                body,
                respondentId,
                questionId
            })
                .then(answer => {
                    return res.status(201).json({
                        "answer": {
                            "message": "Successfully answer added!",
                            "details": {
                                "answer_details": {
                                    "id": answer.dataValues.id,
                                    "answer_body": answer.dataValues.body
                                },
                                "response_details": {
                                    "name": req.user.users.userName,
                                    "email": req.user.users.email
                                }
                            }
                        }
                    })
                }).catch(error => {
                    return res.status(400).json({ error })
                })

        }//if

        // http://localhost:3000/api/answers/:id [PUT]
        else if (req.method === "PUT") {

            Answer.findOne({ where: { id: id } })
                .then(answer => {

                    answer.update({
                        body,
                        respondentId,
                        questionId
                    })
                        .then(answer => {

                            return res.status(202).json({
                                "answer": {
                                    "message": "Successfully answer updated!",
                                    "details": {
                                        "answer_details": {
                                            "id": answer.id,
                                            "answer_body": answer.body,
                                        },
                                        "response_details": {
                                            "name": req.user.users.userName,
                                            "email": req.user.users.email
                                        }
                                    }
                                }
                            })//
                        })
                }).catch(error => {
                    return res.status(400).json({ error })
                })

        }

        // http://localhost:3000/api/answers/:id [DELETE]
        else if (req.method === "DELETE") {

            Answer.destroy({
                where: { id: id }
            })
                .then(() => {
                    return res.status(200).json({
                        "message": "Answer Deleted successfully"
                    })
                }).catch(error => {
                    return res.status(400).json({ error })
                })

        }//else if

    },//end answer
    answerView: (req, res) => {

        let id = req.params.id

        Answer.findOne({
            where: { id: id },
            include: [Comment]
        })
            .then(answer => {
                if (answer.approval) {
                    return res.status(200).json({
                        answer
                    })
                } else {
                    return res.status(206).json({
                        "message": "This answer is waiting for admin approval"
                    })
                }

            }).catch(error => {
                return res.status(400).json({ error })
            })

    }, //end answerView
    // vote for answer
    answerVote: async (req, res) => {
        let user_id = req.user.users.id
        const { vote, answer_id } = req.body

        let vote_obj = null
        let vote_col = null
        if (vote) {
            vote_obj = { upvote: [user_id] }
            vote_col = { 'upvote': db.sequelize.fn('array_append', db.sequelize.col('upvote'), user_id) }
        } else {
            vote_obj = { down_vote: [user_id] }
            vote_col = { 'down_vote': db.sequelize.fn('array_append', db.sequelize.col('down_vote'), user_id) }
        }

        Ansewer_log.findOne({
            where: { answer_id: answer_id }
        }).then((answer_log) => {
            if (!answer_log) {
                Ansewer_log.create({
                    answer_id,
                    ...vote_obj
                }).then(async () => {
                    let id = answer_id
                    let vote_result = await voteCounter.voteCount(id, vote_obj)
                    return res.status(202).json({
                        "total_vote": `Total voted ${vote_result}`
                    })
                })

            } else {
                let upvote = answer_log.upvote ? answer_log.upvote : []
                let down_vote = answer_log.down_vote ? answer_log.down_vote : []

                if (upvote.includes(user_id) || down_vote.includes(user_id)) {
                    return res.status(202).json({
                        "message": `You already voted thank you for your compliments`
                    })
                } else {
                    Ansewer_log.update(
                        vote_col,
                        { 'where': { 'answer_id': answer_id } }
                    ).then(async () => {
                        let id = answer_id
                        let vote_result = await voteCounter.voteCount(id, vote_obj)
                        return res.status(202).json({
                            "total_vote": `Vote updated ${vote_result}`
                        })
                    })

                }

            }

        })
            .catch(error => {
                return res.status(400).json({ error })
            })

    },
    acceptedAnswer: (req, res) => {
        const { answer_id, accepted } = req.body
        let user_id = req.user.users.id
        console.log('accepted 209', accepted);
        Answer.findOne({
            where: { id: answer_id },
            // attributes:['Question.questionerId'],
            // include: { model: Question, as: 'question' }
            include: [{
                model: Question,
                attributes: ['questionerId']
            }]
        }).then((data) => {
            // console.log('data 223', data.respondentId);
            if (data.Question.questionerId === data.respondentId) {
                console.log('224');
                data.update({
                    accepted
                }).then(() => {
                    return res.status(202).json({
                        "message": "Answer accepted successfully"

                    })
                }).catch(error => {
                    return res.status(400).json({ error })
                })
            } else {
                return res.status(406).json({
                    "message": "Only questioner can accepted answer"
                });
            }

        }).catch(error => {
            return res.status(400).json({ error })
        })

    },
    getQuestionAnswers: (req, res) => {

        Question.findAll({
            include: { model: Answer }
        })
            .then(questionAnswer => {
                return res.status(200).json({
                    questionAnswer
                })
            }).catch(error => {
                return res.status(400).json({ error })
            })

    },//end getQuestionAnswers
    updateAnswer: (req, res) => {

        let id = req.params.id
        let { body, approval } = req.body

        Answer.findByPk(id)
            .then(answer => {

                answer.update({
                    body,
                    approval
                })
                    .then(updated_answer => {
                        return res.status(202).json({
                            updated_answer
                        })
                    })
            }).catch(error => {
                return res.status(400).json({ error })
            })

    },//end updateAnswer



}
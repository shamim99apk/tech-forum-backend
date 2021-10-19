// ---------------------------------IMPORTING---------------------------------
//model
const Question = require('../models').Question
const Answer = require('../models').Answer
const Comment = require('../models').Comment
const User = require('../models').User
const ViewLog = require('../models').Question_view_log
var ip = require("ip");
//sequelize
const db = require('../models/index')
const {Op} = require("sequelize");
const voteCounter = require('../functions/voteQuestion')
var counter = 0;

// ---------------------------------CONTROLLERS---------------------------------

module.exports = {

    addQuestion: (req, res) => {
       
        let {title, body, tags} = req.body
        tags = tags.map(v => v.toLowerCase());
        let questionerId = req.user.users.id
        let questionerName = req.user.users.userName
        Question.create({
            title,
            body,
            tags,
            questionerId
        })
            .then(question => {
                return res.status(201).json({
                    "message": "Question created successfully need for approval",
                    "question-details": question,
                    "questionerName": questionerName,
                })//return
            }).catch(error => {
            return res.status(400).json({error})
        })

    },//end addQuestion.
    updateQuestion: (req, res) => {

        let {title, body, tags} = req.body
        tags = tags.map(v => v.toLowerCase());
        let questionerId = req.user.users.id
        let questionerName = req.user.users.userName
        let id = req.params.id

        Question.findOne({
            where: {
                [Op.and]: [
                    {id: id},
                    {questionerId: questionerId}
                ]
            }
        })
            .then(question => {
                if (question) {
                    question.update({title, body, tags})
                        .then(update_question => {
                            return res.status(202).json({
                                "message": "Question updated and waiting for approval",
                                "update_question": update_question,
                                "questionerName": questionerName,
                            })//return
                        })
                } else {
                    return res.status(206).json({
                        "message": "You do not have access to update this question",
                    })//return
                }
            }).catch(error => {
            return res.status(400).json({"error": error})
        })
    },//end updateQuestion.
    deleteQuestion: (req, res) => {
        let id = req.params.id
        let questionerId = req.user.users.id
        Question.destroy({
            where: {
                [Op.and]: [
                    {id: id},
                    {questionerId: questionerId}
                ]
            }
        })
            .then(question => {
                if (question) {
                    return res.status(200).json({
                        "message": `${id} deleted`
                    })//return
                } else {
                    return res.status(401).json({
                        "message": "You are not owner of this question!!!"
                    })//return
                }
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end deleteQuestion.
    questionList: (req, res) => {

        let title = req.query.title
        let tag = req.query.tag
        let unanswered = req.query.unanswered
        let new_question = req.query.new_question
        let submission_date = req.query.submission_date
        let top_views = req.query.top_views
        let top_answer = req.query.top_answer
        let questioner_id = req.query.questioner_id

        let page = parseInt(req.query.page);
        page = page ? page : 1
        let limit = 10
        let offset = page ? (page - 1) * limit : 0;
        //sequelize query
        let where = [{approval: true}]
        // filter part condition wise date show
        title ? where.push({title: {[Op.like]: '%' + title + '%'}}) : null;
        tag ? where.push({tags: {[Op.contains]: [tag]}}) : null;
        questioner_id ? where.push({questionerId: {[Op.eq]: [questioner_id]}}) : null;
        submission_date ? where.push(db.sequelize.where(db.sequelize.fn('date', db.sequelize.col('Question.createdAt')), '=', submission_date)): null
    //    sorting part show data order by asec or desc
        let ord = new_question ? [['id', 'DESC']] : null;
        let top_view =  top_views ? [['viewCount', 'DESC']]: null;
        let top_ans =  top_answer ? [[db.sequelize.fn('COUNT', db.sequelize.col('Answers.id')), 'DESC']]: null;
        // condional working with aggregate functions with group by
        let having = unanswered ? db.sequelize.literal(`count("Answers"."id") < 1`) : null
  
        Question.findAndCountAll({
            limit: limit,
            offset: offset,
            where: where,
            attributes: ['id', 'title', 'body', 'tags', 'approval', 'viewCount','upvote_count','down_vote','pinned_count','createdAt', 'updatedAt',
                [db.sequelize.fn('COUNT', db.sequelize.col('Answers.id')), 'ans_count']],
            include: [
                {
                    model: User,
                    attributes: ['userName']
                },
                {
                    model: Answer, 
                    attributes: []
                }
            ],
            group: ['Question.id', 'User.id'],
            having: having ,
            order: ord || top_view || top_ans ,
            subQuery: false,
        })
            .then(questions => {

                const totalQuestion = questions.count.length
                const totalPage = Math.ceil(totalQuestion / limit);

                return res.status(200).json({
                    "pagination": {
                        "totalPage": totalPage,
                        "current_page": page,
                        "totalQuestion": totalQuestion,
                    },
                    "questions": questions.rows,
                })//return

            }).catch(error => {
            return res.status(400).json({error})
        })

    },//end questionList.
    question: (req, res) => {

        let id = req.params.id
        // console.log('153')
        Question.findOne({
            where: {id: id}
        })
            .then(question => {

                if (question.approval) {
                    return res.status(200).json({
                        question
                    })
                } else {
                    return res.status(200).json({
                        "message": "This question is waiting for admin approval"
                    })
                }

            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end singleQuestion.
    questionAnswerDetails: (req, res) => {

        let id = req.params.id

        Question.findByPk(id, {
                include: [
                    {
                        model: User,
                        attributes: ['userName']
                    },
                    {
                        model: Comment,
                        include: [{
                            model: User,
                            attributes: ['userName']
                        }]
                    },
                    {
                        model: Answer,
                        include: [
                            {
                                model: User,
                                attributes: ['userName', 'profile']
                            },
                            {
                                model: Comment,
                                include: [{
                                    model: User,
                                    attributes: ['userName']
                                }]
                            }
                        ]
                    }
                ]
            }
        )
            .then(question => {

                if (question.approval) {
                    return res.status(200).json({
                        "question_details": question,
                        "total_answer": question.Answers.length
                    })//return
                } else if (!question.approval) {
                    return res.status(206).json({
                        "message": "This question is waiting for admin approval"
                    })//return
                }

            }).catch(error => {
            return res.status(400).json({error})
        })

    },//end questionAnswerDetails.
    pendingQuestionList: (req, res) => {

        let page = parseInt(req.query.page);
        page = page ? page : 1;
        let limit = 10
        let offset = page ? (page - 1) * limit : 0;

        Question.findAndCountAll({
            where: {approval: false},
            limit: limit,
            offset: offset,
            include: {
                model: User,
                attributes: ['userName']
            }
        })
            .then(questions => {
                const totalPage = Math.ceil(questions.count / limit);
                if (questions) {
                    return res.status(200).json({
                        "pagination": {
                            "current_page": page,
                            "total_page": totalPage,
                            "total_questions": questions.count,
                            "limit": limit,
                            "offset": offset,
                        },
                        "questions": questions.rows
                    })
                } else {
                    return res.status(204).json({
                        "message": "No more question is waiting for admin approval"
                    })
                }
            }).catch(error => {
            return res.status(400).json({error})
        })

    },//end pendingQuestionList.
    getPendingQuestion: (req, res) => {

        let id = req.params.id

        Question.findByPk(id, {
            where: {approval: false},
            include: {model: User, attributes: ['userName']}
        })
            .then(question => {

                if (question) {
                    return res.status(200).json({
                        question
                    })
                } else {
                    return res.status(204).json({
                        "message": "No more question is waiting for admin approval"
                    })
                }

            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end pendingQuestion.
    updatePendingQuestion: (req, res) => {

        let {title, body, tags, approval} = req.body
        let id = req.params.id

        Question.findByPk(id, {
            where: {approval: false}
        })
            .then(question => {
                question.update({
                    title,
                    body,
                    tags,
                    approval
                })
                    .then(question => {
                        return res.status(202).json({
                            "success": true,
                            "question": question
                        })
                    })
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end updatePendingQuestion.
    approvePendingQuestion: (req, res) => {

        let {approval} = req.body
        let id = req.params.id

        Question.findByPk(id, {
            where: {approval: false}
        })
            .then(question => {
                question.update({approval})
                    .then(question => {
                        return res.status(202).json({
                            "success": true,
                        })
                    })
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end updatePendingQuestion.
    deletePendingQuestion: (req, res) => {

        let id = req.params.id

        Question.findByPk(id, {
            where: {approval: false}
        })
            .then(question => {
                question.destroy()
                    .then(question => {
                        return res.status(200).json({
                            "Success": true
                        })
                    })
            })
    },//end deletePendingQuestion
    tagList: async (req, res) => {

        const totalTag = await db.sequelize.query(
            'select count(*) from (select distinct unnest(tags) as tag from public."Questions") as tag_table',
            {type: db.sequelize.QueryTypes.SELECT}
        );
        let page = parseInt(req.query.page);
        const limit = 15;
        let offset = page ? (page - 1) * limit : 0;
        const totalPage = Math.ceil(totalTag[0].count / limit);
        page = page ? page : 1;
        page = page > totalPage ? totalPage : page;

        db.sequelize.query(
            'select distinct unnest(tags) as tag from public."Questions" where approval=false ' +
            'limit ' + limit +
            ' offset ' + offset,
            {type: db.sequelize.QueryTypes.SELECT}
        )
            .then(tags => {
                return res.status(200).json({
                    "pagination": {
                        "current_page": page,
                        "totalPage": totalPage,
                        "totalTag": totalTag,
                    },
                    "tags": tags,
                })//return
            }).catch(error => {
            return res.status(400).json({error})
        })

    },//end tagList.
    latestQuestion: (req, res) => {
        Question.findAll({
            where: {approval: true},
            limit: 5,
            order: [['id', 'DESC']]
        })
            .then(question => {
                return res.status(200).json({
                    question
                })
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end latestQuestion.
    latestPendingQuestion: (req, res) => {
        Question.findAll({
            where: {approval: false},
            limit: 5,
            order: [['id', 'DESC']]
        })
            .then(question => {
                return res.status(200).json({
                    question
                })
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end latestQuestion.
    views: (req, res) => {

        let id = req.params.id

        let userId

        if (req.user) {
            userId = req.user.users.id
        } else {
            userId = null
        }

        let data = {
            "ip": [],
            "userId": []
        }

        ViewLog.findOne({
            where: {questionId: id}
        })
            .then(logs => {

                if (logs === null) {

                    data.ip.push(ip.address())
                    data.userId.push(userId)

                    ViewLog.create({
                        questionId: id,
                        data: data
                    })
                        .then(log => {

                            Question.findByPk(id)
                                .then(view_count => {

                                    let viewCount = ++view_count.viewCount

                                    view_count.update({viewCount})
                                        .then(total_count => {

                                            return res.status(200).json({
                                                "total_count": total_count.viewCount
                                            })

                                        })

                                })
                        })
                } else if (logs.data.ip.includes(ip.address()) || logs.data.userId.includes(userId)) {
                    Question.findByPk(id)
                        .then(total_count => {

                            return res.status(200).json({
                                "total_count": total_count.viewCount
                            })

                        })
                } else {

                    logs.data.ip.push(ip.address())
                    logs.data.userId.push(userId)

                    ViewLog.update({
                        questionId: id,
                        data: data
                    })
                        .then(() => {
                            Question.findByPk(id)
                                .then(view_count => {

                                    let viewCount = ++view_count.viewCount

                                    view_count.update({viewCount})
                                        .then(total_count => {

                                            return res.status(200).json({
                                                "total_count": total_count.viewCount
                                            })

                                        })
                                })
                        })

                }
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end views

    // upvote and downvote for questions 
    voteForQuestion: (req, res) => {
        const { question_id, vote } = req.body
       let user_id = req.user.users.id
        console.log('525',question_id)
        let upvote_data = []
       let down_vote_data = []

        ViewLog.findOne({
            where: {
                questionId: question_id,
                [Op.or]: {
                    down_vote_data: {
                        [Op.contains]: [user_id]
                      },
                      upvote_data: {
                        [Op.contains]: [user_id]
                      },
                    }

            },
        })
            .then(vote_question => {
                console.log('535',vote_question)
                if (!vote_question) {
                    console.log('537')
                    upvote_data.push(user_id)
                    if(vote){
                        ViewLog.create({
                            upvote_data: upvote_data,
                            questionId:question_id
                        })
                            .then(() => {
                                let id = question_id
                                Question.findByPk(id)
                                    .then(view_count => {
    
                                        let upvote_count = ++view_count.upvote_count;
    
                                        view_count.update({upvote_count})
                                            .then(total_count => {
    
                                                return res.status(200).json({
                                                    "total_count": total_count.upvote_count
                                                })
    
                                            })
    
                                    })
                            })
                    }else {
                        console.log('562')
                        down_vote_data.push(user_id)

                        ViewLog.update({
                            down_vote_data: down_vote_data,
                            questionId:question_id
                        })
                            .then(() => {
                                let id = question_id
                                Question.findByPk(id)
                                    .then(view_count => {
    
                                        let down_vote = ++view_count.down_vote
    
                                        view_count.update({down_vote})
                                            .then(total_count => {
    
                                                return res.status(200).json({
                                                    "total_count": total_count.down_vote
                                                })
    
                                            })
                                    })
                            })
                    }
                   
                } else {

                    return res.status(406).json({
                        "message": 'You have already voted thank you for you vote'
                    })

                }
            }).catch(error => {
            return res.status(400).json({error})
        })
    },
    popularTags: (req, res) => {

        // console.dir ( ip.address() );
        // console.log(req)
        db.sequelize.query('SELECT unnest(tags) as tag, COUNT(*) \n' +
            'FROM public."Questions"\n' +
            'where approval=true \n' +
            'GROUP BY tag\n' +
            'order by count desc \n' +
            'limit 5',
            {type: db.sequelize.QueryTypes.SELECT}
        )
            .then(tags => {
                return res.status(200).json({
                    tags
                })
            }).catch(error => {
            return res.status(400).json({error})
        })
    },//end popularTags.

    // user owner question list
    userQuestionList: (req, res) => {
        
        let user_id = req.user.users.id
        // pagination
        let page = parseInt(req.query.page);
        page = page ? page : 1
        let limit = 10
        let offset = page ? (page - 1) * limit : 0;

        //sequelize query
        let where = []
        // filter part condition wise date show
        user_id ? where.push({questionerId: {[Op.eq]: [user_id]}}) : null;

        Question.findAndCountAll({
            limit: limit,
            offset: offset,
            where: where,
            attributes: ['id', 'title', 'body', 'tags', 'approval', 'viewCount','upvote_count','down_vote','pinned_count','createdAt', 'updatedAt',
                [db.sequelize.fn('COUNT', db.sequelize.col('Answers.id')), 'ans_count']],
            include: [
                {
                    model: User,
                    attributes: ['userName']
                },
                {
                    model: Answer, 
                    attributes: []
                }
            ],
            group: ['Question.id', 'User.id'],
            order: [['id', 'DESC']] ,
            subQuery: false,
        })
            .then(questions => {

                const totalQuestion = questions.count.length
                const totalPage = Math.ceil(totalQuestion / limit);

                return res.status(200).json({
                    "pagination": {
                        "total_page": totalPage,
                        "current_page": page,
                        "total_question": totalQuestion,
                    },
                    "questions": questions.rows,
                })

            }).catch(error => {
            return res.status(400).json({error})
        })

    },//end
// pinned and unpinned questions
    pinnedQuestion: async (req, res) => {
        const { question_id, pinned_question } = req.body
        let user_id = req.user.users.id
        let vote_col = null
        let vote_obj = null
        if (pinned_question) {
            vote_obj = { pinned_by_user: [user_id] }
            vote_col = { 'pinned_by_user': db.sequelize.fn('array_append', db.sequelize.col('pinned_by_user'), user_id) }
        } else {
            vote_obj = { pinned_by_user: [user_id] }
            vote_col = { 'pinned_by_user': db.sequelize.fn('array_append', db.sequelize.col('pinned_by_user'), user_id) }
        }
     
 
         ViewLog.findOne({
            where: { questionId: question_id }
         }).then(async(pinned_qus) => {
            if (!pinned_qus) {
               
                ViewLog.create({
                    questionId: question_id,
                    ...vote_obj
                }).then(async () => {
                    let id = question_id
                    let vote_result = await voteCounter.voteQuestion(id, vote_obj)
                    return res.status(202).json({
                        "total_vote": `Total voted ${vote_result}`
                    })
                })

            } else {
                console.log('728',pinned_qus.pinned_by_user)
                let id = question_id
                if (pinned_qus.pinned_by_user.includes(user_id)) {
                    let pinned_by_user = pinned_qus.pinned_by_user
                        let i = pinned_by_user.indexOf(user_id);
                        if (pinned_by_user > -1) {
                            pinned_by_user.splice(i, 1);
                          }

                    ViewLog.update(
                        { 'pinned_by_user': db.sequelize.fn('array_remove', db.sequelize.col('pinned_by_user'), user_id) },
                        { 'where': { 'questionId': question_id } }
                    )
                    vote_obj = {down_vote: [user_id]}
                    let vote_result = await voteCounter.voteQuestion(id, vote_obj)
                    return res.status(202).json({
                        "message": `Unpinned  your question ${vote_result}`
                    })
                } else {
                    ViewLog.update(
                        vote_col,
                        { 'where': { 'questionId': question_id } }
                    ).then(async () => {
                        let id = question_id
                        let vote_result = await voteCounter.voteQuestion(id, vote_obj)
                        return res.status(202).json({
                            "total_vote": `Pinned  new user append ${vote_result}`
                        })
                    })

                }

            }
            
         }).catch(error => {
            return res.status(400).json({error})
        })

       
    },//end

    // all pinned questions get by only pinned user
    pinnedQuestionGet: (req, res) => {

        
        // let user_id = req.user.users.id
        let user_id = 1
        // pagination
        // let page = parseInt(req.query.page);
        // page = page ? page : 1
        // let limit = 10
        // let offset = page ? (page - 1) * limit : 0;

        //sequelize query
        // let where = []
        // // filter part condition wise date show
        // user_id ? where.push({pinned_by_user: {[Op.contains]: [user_id]}}) : null;
        console.log('774')
      
        
        ViewLog.findAll({
            where: {
                pinned_by_user: {
                        [Op.contains]: [user_id],
                        
                      }
            },
            attributes: [],
            include: [
                {
                model: Question,
                attributes: ['id', 'title', 'tags', 'approval', 'viewCount','upvote_count','down_vote','pinned_count','createdAt', 'updatedAt','questionerId'
                // [db.sequelize.fn('COUNT', db.sequelize.col('Answers.id')), 'ans_count']
               ],
                // attributes: ['questionerId']
            },//end
            
            // {
            //     model: Answer, 
            //     attributes: []
            // }
            
        ],
        // group: ['Answer.id'],
      
        })
            .then(questions => {
                console.log('801',questions)
                // const totalQuestion = questions.count.length
                // const totalPage = Math.ceil(totalQuestion / limit);

                return res.status(200).json({
                    // "pagination": {
                    //     "total_page": totalPage,
                    //     "current_page": page,
                    //     "total_question": totalQuestion,
                    // },
                    "questions": questions,
                })

            }).catch(error => {
            return res.status(400).json({error})
        })
       
    }
}

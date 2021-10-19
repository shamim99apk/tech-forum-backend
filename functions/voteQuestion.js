const Question = require('../models').Question
module.exports = {
    voteQuestion: async (id,vote_obj) => {
    console.log('4 vote_count function',typeof(vote_obj))
    let result 
    if (vote_obj.hasOwnProperty('pinned_by_user')) {
       await Question.findByPk(id)
        .then(async(vote_count) => {
            let pinned_count = ++vote_count.pinned_count
           await vote_count.update({ pinned_count }).then((total_vote) => {
               return result = `total pinned question ${total_vote.pinned_count}`
          
            })
        })
    }else{
       await Question.findByPk(id)
        .then( async(vote_count) => {
            let pinned_count = --vote_count.pinned_count
           await vote_count.update({ pinned_count }).then((total_vote) => {
                return result = `total pinned question ${total_vote.pinned_count}`
            })
        })
    }

     return result;

    }
}
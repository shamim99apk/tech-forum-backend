const Answer = require('../models').Answer
module.exports = {
    voteCount: async (id,vote_obj,res) => {
    console.log('4 vote_count function',typeof(vote_obj))
    let result 
    if (vote_obj.hasOwnProperty('upvote')) {
       await Answer.findByPk(id)
        .then(async(vote_count) => {
            let upvote_count = ++vote_count.upvote_count
           await vote_count.update({ upvote_count }).then((total_vote) => {
               return result = `total upvote voted - ${total_vote.upvote_count}`
          
            })
        })
    }else{
       await Answer.findByPk(id)
        .then( async(vote_count) => {
            let down_vote_count = ++vote_count.down_vote_count
           await vote_count.update({ down_vote_count }).then((total_vote) => {
                return result = `total down voted - ${total_vote.down_vote_count}`
            })
        })
    }

     return result;

    }
}
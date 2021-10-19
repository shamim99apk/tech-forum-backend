// ---------------------------------IMPORTING---------------------------------
//express
const express = require('express');
//packages
const bodyParser = require('body-parser')
const cors = require('cors')
const nodemailer = require('nodemailer')
const morgan = require('morgan')

//router
const getRegisterRouter = require('./routers/userRouters')
const questionRouter = require('./routers/questionRouter')
const answerRouter = require('./routers/answerRouter')
const commentRouter = require('./routers/commentRouter')
const roleRouter = require('./routers/roleRouter')
const dashboardRouter = require('./routers/deshboardRouter')
const permission = require('./routers/permissionRouter')
const academic_info = require('./routers/academic_info')
const user_job_info = require('./routers/user_job_info')
const user_training_info = require('./routers/user_training_info')
const countryRouter = require('./routers/countryRouter')

// ---------------------------------CONFIGURATION---------------------------------
const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'))
app.use(express.json())
app.use(cors())
app.use('/profile', express.static('upload/images'));
app.use('/cv', express.static('upload/cv'));
require('dotenv').config()
app.set("view engine", "ejs")

// ---------------------------------ROUTING---------------------------------
app.use('/api', getRegisterRouter)
app.use('/api', questionRouter)
app.use('/api', answerRouter)
app.use('/api', commentRouter)
app.use('/api', roleRouter)
app.use('/api', dashboardRouter)
app.use('/api', permission)
app.use('/api', academic_info)
app.use('/api', user_job_info)
app.use('/api', user_training_info)
app.use('/api', countryRouter)


app.get("/", (req, res) => res.render("home"))

// ---------------------------------PORT DEFINE---------------------------------
// app.listen(process.env.port || 3001);
app.listen(process.env.PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log(`Server listening on Port http://localhost:${process.env.PORT}`)
})
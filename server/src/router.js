const express = require('express')
const authorization = require('./middleware/Authorization')
const uriIdsCheck = require('./middleware/UriIdsCheck')
const UserController = require('./controllers/UserController')
const LabelController = require('./controllers/LabelController')
const HappeningController = require('./controllers/HappeningController')

// Public access routes

const publicRouter = express.Router()

publicRouter.post('/auth/token', UserController.generateToken)
publicRouter.post('/auth/refreshing', UserController.refreshToken)

// Private access routes

const privateRouter = express.Router()
privateRouter.use(authorization)

privateRouter.post('/labels', LabelController.create)
privateRouter.get('/labels', LabelController.readAll)
privateRouter.put('/labels/:labelId', uriIdsCheck, LabelController.update)
privateRouter.delete('/labels/:labelId', uriIdsCheck, LabelController.delete)

privateRouter.post('/happenings', HappeningController.create)
privateRouter.get('/happenings', HappeningController.readAll)
privateRouter.put('/happenings/:happeningId', uriIdsCheck, HappeningController.update)

module.exports = { publicRouter, privateRouter }

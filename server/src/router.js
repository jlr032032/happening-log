const express = require('express')
const Auth = require('./middleware/Authorization')
const IdChk = require('./middleware/UriIdsCheck')
const UserCtlr = require('./controllers/UserController')
const LabelCtlr = require('./controllers/LabelController')
const HappeningCtlr = require('./controllers/HappeningController')
const RecordCtlr = require('./controllers/RecordController')

let router = express.Router()

router.post('/auth/token', UserCtlr.generateToken)
router.post('/auth/refreshing', UserCtlr.refreshToken)
router.delete('/auth/token', Auth, UserCtlr.deleteToken)

router.post('/user', UserCtlr.signUp)
router.post('/user/password-resetting', UserCtlr.resetPassword)
router.post('/user/unblocking-email', UserCtlr.sendUnblockingEmail)
router.get('/user/confirmation/:token', UserCtlr.confirmSignup)
router.get('/user', Auth, UserCtlr.getUser)
router.put('/user/email', Auth, UserCtlr.updateEmail)
router.put('/user/password', Auth, UserCtlr.updatePassword)
router.delete('/user', Auth, UserCtlr.delete)

router.get('/usuario/desbloqueo/:token', UserCtlr.unblock)

router.post('/labels', Auth, LabelCtlr.create)
router.get('/labels', Auth, LabelCtlr.readAll)
router.put('/labels/:labelId', Auth, IdChk, LabelCtlr.update)
router.delete('/labels/:labelId', Auth, IdChk, LabelCtlr.delete)

router.post('/happenings', Auth, HappeningCtlr.create)
router.get('/happenings', Auth, HappeningCtlr.readAll)
router.get('/happenings/:happeningId', Auth, IdChk, HappeningCtlr.readOne)
router.put('/happenings/:happeningId', Auth, IdChk, HappeningCtlr.update)
router.delete('/happenings/:happeningId', Auth, IdChk, HappeningCtlr.delete)

router.post('/happenings/:happeningId/records', Auth, RecordCtlr.create)
router.get('/happenings/:happeningId/records', Auth, RecordCtlr.readByHappeningId)
router.put('/happenings/:happeningId/records/:recordId', Auth, IdChk, RecordCtlr.update)
router.delete('/happenings/records/:recordId', Auth, IdChk, RecordCtlr.delete)

module.exports = router

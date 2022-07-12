const express = require('express')
const router = express.Router()

const AuthController = require('../../server/controllers/AuthController')

router.get('/', AuthController.index)
router.post('/show', AuthController.show)
router.post('/register', AuthController.register)
router.post('/update', AuthController.update)
router.post('/delete', AuthController.destroy)


module.exports = router
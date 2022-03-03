const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()

//Валидация тела реквеста
const {body} = require('express-validator')
const authMiddleWare = require('../middlewares/auth-middlware')

//В body мы передаем название поля которой к нам приходит с фронта. которое мы хотим провалидировать
router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min:3, max: 32}),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refreshToken)
router.get('/activate/:link', userController.activate)
router.get('/users', authMiddleWare, userController.getUsers)


module.exports = router
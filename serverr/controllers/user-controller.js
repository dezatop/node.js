const userService = require('../service/user-service')
const ApiError = require('../exceptions/api-error')

//Сюда будет приходить результат валдидации. Валидацию мы описывали в файле с роутами.
const {validationResult} = require('express-validator')

class userController {
    async registration (req, res, next){
        try {
            //Он Достанет из тела запроса автоматически нужные ему поля которые мы указали в роутах
            const errors = validationResult(req)

            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка валидации email and password', errors.array()))
            }

            const {email, password} = req.body
            const userData = await userService.registration(email,password)

            //Записываем в куки рефреш токен будет работать если мы установим CookieParser и в index.js инициализируем его
            //maxAge показівает сколько будет жить куки в данній момент (15дней) httpOnly говорит о том что пользователь не сможет не как изменить куку в браузере

            res.cookie('refreshToken', userData.refreshToken,{maxAge: 15 * 24 * 60 * 60 * 1000, httpOnly: true})
           return res.json(userData)
        } catch (err) {
            next(err)
        }
    }

    async login (req, res, next){
        try {
            const {email, password} = req.body
            const userData = await userService.login(email,password)
            res.cookie('refreshToken', userData.refreshToken,{maxAge: 15 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (err) {
            next(err)
        }
    }

    async logout (req, res, next){
        try {
            //Достаем куки из браузера делаеться таким образом)
            const {refreshToken} = req.cookies
            const token = userService.logout(refreshToken)
            //Удаление куки с браузера
            res.clearCookie('refreshToken')

            return res.json({message:'Пользователь разлогини'})
        } catch (err) {
            next(err)
            console.log(err,'Ошибка в авторизации')
        }
    }

    async activate (req, res, next){
        try {
            //Линк в парметрах это то что мы прописывали в роутах router.get('/activate/:link')
            //Динамический параметр
            const activatedLink = req.params.link

            await userService.activate(activatedLink)
            //После активации редиректим человека на главную страницу фронта
            return res.redirect(process.env.API_CLIENT_URL)
        } catch (err) {
            next(err)
            console.log(err,'Ошибка в авторизации')
        }
    }

    async refreshToken (req, res, next){
        try {
            const {refreshToken} = req.cookies
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken,{maxAge: 15 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)

        } catch (err) {
            next(err)
            console.log(err,'Ошибка в авторизации')
        }
    }

    async getUsers (req, res, next){
        try {
            const user = await userService.getUsersAll()
            return res.json(user)
        } catch (err) {
            next(err)
            console.log(err,'Ошибка в авторизации')
        }
    }
}



module.exports = new userController()
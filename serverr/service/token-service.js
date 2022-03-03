const jwt = require('jsonwebtoken')
const tokenModal = require('../models/token-modal')


class TokenService {
    generateTokens (payload) {
        //Генерирует токен 1 Данные пользователя. 2. Секретный ключ для генерации. 3.Указываються опции. Жизнь токена и другое
        const accesssToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY,{expiresIn: '1d'})

        //Если пользователь не заходил на сайт 30 дней то прийдеться занаво логиниться
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY,{expiresIn: '15d'})

        return {
            accesssToken,
            refreshToken
        }

    };

    async saveToken (userId, refreshToken) {
        //Ищем юзера по айди
        const tokenData = await  tokenModal.findOne({user: userId})
        if(tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        //Если функция не отработала значит пользователь авторизовіваеться первій раз и его нужно создать в єтой колекции
        const token = await tokenModal.create({user:userId, refreshToken})
        return token

};

    async removeToken (refreshToken) {
        //Удаление нужного нам рефреш токена
        const tokenData = await tokenModal.deleteOne({refreshToken})
        return tokenData
    }

    //Проверка на валидній токен убеждаемся в том что токен не біл подделан

    async validationToken (token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY)
            return userData
        } catch (err){
            return null;
        }
    }

    //Проверка на валидній рефреш токен убеждаемся в том что токен не біл подделан
    async validationTokenRefresh (token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY)
            return userData
        } catch (err){
            return null
        }
    }

    //Находим токен в бд

    async findToken (refreshToken) {
        //Удаление нужного нам рефреш токена
        const tokenData = await tokenModal.findOne({refreshToken})
        return tokenData
    }

}

module.exports = new TokenService()
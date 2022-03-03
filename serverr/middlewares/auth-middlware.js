const ApiError = require('../exceptions/api-error')
const jwt = require('jsonwebtoken')



module.exports = function (req, res, next) {
    try{
        const authorizationHeader = req.headers.authorization
        if(!authorizationHeader) {
           return next(ApiError.UnouthorizedError())
        }

        //В поле авторизации в хедере будет указан Berer и через пробел токен что бі его достать делаем такую запись
        const accessToken = authorizationHeader.split(' ')[1]
        if(!accessToken) {
            return  next(ApiError.UnouthorizedError())
        }

        const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY)
        if(!userData) {
            return next(ApiError.UnouthorizedError())
        }

        req.user = userData
        next()
    } catch (err) {
        return next(ApiError.UnouthorizedError())
    }
}
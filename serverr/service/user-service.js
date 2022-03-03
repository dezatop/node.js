const UserModal = require('../models/user-modal')
const mailService = require('./mail-service')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const tokenService = require('./token-service')
const UserDto = require('../dtos/index')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration (email, password) {
            //Проходимся по моделе, и ищем по полю емейл и проверяем единственное оно или нет
            const candidate = await UserModal.findOne({email})
            if(candidate){
                ApiError.BadRequest(`Пользователь с почтовым адрессом уже существует ${email}`)
            }

            //Хеширофания пороля с помощью bcrypt
            const hashPassword = await bcrypt.hash(password, 3)

            //Вернет рандомную сгенерированную строку
            const activeAccountLink = uuid.v4();
            const user = await UserModal.create({email, password:hashPassword,activationLink:activeAccountLink })
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activeAccountLink}`)
            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})
            await tokenService.saveToken(userDto.id, tokens.refreshToken)

            return {...tokens, users: userDto}
    }

    async activate(activationLink) {
        const user = await UserModal.findOne({activationLink})
        if(!user) {
            ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true
        //Если мы что-то изменяем объекте после этого нужно выполнить команду save обязательно
        await user.save()
        return user
    }

    async login(email,password){
        const user = await UserModal.findOne({email})
        if(!user){
            throw ApiError.BadRequest('Пользователь не зарегестрирован')
        }
        //Сравнивает пороли первый мы передаем пороль который пришел с фронта второй мы берем из бд
        const isPassword = await bcrypt.compare(password, user.password)
        if(!isPassword) {
            throw ApiError.BadRequest('Неправильній пороль')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, users: userDto}
    }

    async logout (refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
    }

    async refresh (refreshToken) {
        //Если куки пришла null или undefined тогда выкидываем ошибку о том что пользователь не авторизован
        if(!refreshToken) {
            throw ApiError.UnouthorizedError()
        }

        const userData = await tokenService.validationTokenRefresh(refreshToken)
        const tokenFromBd = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromBd){
            throw ApiError.UnouthorizedError()
        }


        //Если пользователь авторизирован то мы ему обновляем просто токены
        console.log(userData.id)
        const user = await UserModal.findById(userData.id)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, users: userDto}
    }

    async getUsersAll () {
        //Когда передаем find без параметров вернет абсолютно все
        const userData = await UserModal.find()
        return userData
    }

}

module.exports = new UserService()


require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const router = require('./route/index');
const errMidelware = require('./middlewares/error-midlleware')

//Что бы использовать конфигуроционные файлы подключение к env выполняеться так. process.env.(переменна)
const PORT = process.env.PORT || 5000
const app = express()
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: process.env.API_CLIENT_URL
}))
app.use('/api', router)
//Мидл вар должен всегда быть последним
app.use(errMidelware)


const startApp = async () => {

    try {
        await mongoose.connect(process.env.DB_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        app.listen(PORT,  ()=>console.log('Сервер запущен на ', PORT))
    } catch (err) {
        console.log(err,'Ошибка запуска')
    }

}

startApp()
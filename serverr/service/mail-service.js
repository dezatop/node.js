const nodemailer = require('nodemailer')

class MailService {

    constructor() {
        //Настройка всех конфигураций для отправки сообщения через почту
        //Google => настройки => все настройки => пересылка POP/IMAP => включить IMAP
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure:false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
        })
    }

    async sendActivationMail (email, link) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to:email,
                subject: `Здесь пишем тему письма например. Активация аккаунта`,
                text:'',
                html: `<div>
                    <h1>Тут можем писать верстку</h1>
                    <a href=${link}>${link}</a>
                </div>`
            })
        } catch (err) {
            console.log('ОШИБКА В ПОДКЛЮЧЕНИИ')
        }
    }
}

module.exports = new MailService()
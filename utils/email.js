/* eslint-disable no-undef */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Bryan Ochoa <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //sendgrid
            return 1;
        }
        //1)create a transporter
        return nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 25,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
            //activate en gmail "less secure app" options
        });
    }

    //send the actual email
    async send(template, subject) {
        //1)render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject,
        });

        //2)define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html,
            text: htmlToText.fromString(html),
        };

        //3)create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the natours Family');
    }
    async sendPasswordReset() {
        await this.send("passwordReset", "Your passowrd reset token(valido por 10 min)");
    }
}

// const sendEmail = async options => {
//     //1)create a transporter
//     const transporter = nodemailer.createTransport({
//         host: "smtp.mailtrap.io",
//         port: 25,
//         secure: false,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//         //activate en gmail "less secure app" options
//     });
//     //2)define the email options
//     const mailOptions = {
//         from: "Bryan Ochoa<koso@koso.com>",
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }
//     //3)enviar el correo
//     await transporter.sendMail(mailOptions)
// }
module.exports = Email;
// sendEmail,
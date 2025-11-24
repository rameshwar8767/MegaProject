import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async(options)=>{
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
        }
    });

    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
    const emailBody = mailGenerator.generate(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, 
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail={
        from: 'mail.taskmanger.com',
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailBody
    }

    try {
        await transporter.sendMail(mail);   
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

const emailVerificationMailGenContent = (username,verificationUrl)=>{
    return {
        body:{
            name: username,
            intro: 'Welcome to Task Manager! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with Task Manager, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Verify your account',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const forgotPasswordMailGenContent = (username,resetPasswordUrl)=>{
    return {
        body:{
            name: username,
            intro: 'You have requested to reset your password.',
            action: {
                instructions: 'To reset your password, please click here:',
                button: {
                    color: '#DC4D2F',
                    text: 'Reset your password',
                    link: resetPasswordUrl
                }
            },
            outro: 'If you did not request a password reset, please ignore this email.'
        }
    }
}

export {sendMail, emailVerificationMailGenContent, forgotPasswordMailGenContent};
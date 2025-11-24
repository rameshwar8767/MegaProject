import Mailgen from "mailgen";
import nodemailer from "nodemailer";




// const sendMail = async (options) => {

//     if (!options.mailgenContent) {
//         console.error("❌ ERROR: mailgenContent is missing in sendMail()");
//         throw new Error("mailgenContent is missing");
//     }

//     const mailGenerator = new Mailgen({
//         theme: "default",
//         product: {
//             name: "Task Manager",
//             link: process.env.FRONTEND_URL,
//         },
//     });

//     const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
//     const emailBody = mailGenerator.generate(options.mailgenContent);

//     const transporter = nodemailer.createTransport({
//         host: process.env.MAILTRAP_SMTP_HOST,
//         port: process.env.MAILTRAP_SMTP_PORT,
//         secure: false,
//         auth: {
//             user: process.env.MAILTRAP_SMTP_USER,
//             pass: process.env.MAILTRAP_SMTP_PASS,
//         },
            
//         debug: true,     // <-- ADD THIS
//         logger: true,
//     });

//     const mail = {
//         from: "no-reply@taskmanager.com",
//         to: options.to,
//         subject: options.subject,
//         text: emailText,
//         html: emailBody,
//     };

//     try {
//         await transporter.sendMail(mail);
//         console.log("Email sent successfully to:", options.to);
//     } catch (error) {
//         console.error("❌ Nodemailer Error:", error);
//         throw new Error("Email sending failed");
//     }
// };
const sendMail = async (options) => {
    console.log("📨 sendMail() called with:", options);

    if (!options.mailgenContent) {
        console.error("❌ ERROR: mailgenContent is missing in sendMail()");
        throw new Error("mailgenContent is missing");
    }

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: process.env.FRONTEND_URL,
        },
    });

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailBody = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
        logger: true,   // IMPORTANT
        debug: true     // IMPORTANT
    });

    const mail = {
        from: "no-reply@taskmanager.com",
        to: options.to,
        subject: options.subject,
        text: emailText,
        html: emailBody,
    };

    try {
        console.log("📨 Sending email via Mailtrap...");
        await transporter.sendMail(mail);
        console.log("✅ Email sent successfully to:", options.to);
    } catch (error) {
        console.error("🚨 REAL NODEMAILER ERROR:", error);
        throw error;   // do not hide real error
    }
};



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
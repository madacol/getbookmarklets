import { MAIL_PASSSWORD, MAIL_USER, ADMIN_MAIL } from "$env/static/private";
import { createTransport } from "nodemailer";

/**
 * Send mail to user
 * @param {string | string[]} to - an email or list of emails to send to
 * @param {string} subject 
 * @param {string} text 
 */
export function sendMail(to, subject, text) {
    return new Promise((resolve) => {
        let mailTransporter = createTransport({
            service: 'gmail',
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASSSWORD
            }
        });

        /** @type {import("nodemailer/lib/mailer").Options} */
        let mailDetails = {
            from: 'notification@friendpals.ca',
            to,
            subject,
            text
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                return console.error({err, data});
            }
            console.log('Email sent successfully', to, subject);
            return resolve(data);
        });
    })
}

/**
 * @param {string} subject
 * @param {string} text
 */
export function mailAdmin(subject, text) {
    const to = ADMIN_MAIL || MAIL_USER;
    return sendMail(to, subject, text);
}

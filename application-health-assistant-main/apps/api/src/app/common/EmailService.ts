import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export default class EmailService {
    private transporter;

    /**
     *
     * @param configService
     */
    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('API_SMTP_HOST'),
            port: this.configService.get<number>('API_SMTP_PORT'),
            secure: false,
        });
    }

    /**
     *
     * @param subject
     * @param message
     */
    async sendEmail(subject: string, message: string) {
        const mailOptions = {
            from: this.configService.get<string>('API_MAIL_FROM'),
            to: this.configService.get<string>('API_MAIL_TO'),
            subject,
            text: message,
        };

        await this.transporter.sendMail(mailOptions);
    }
}

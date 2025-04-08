import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';

import EmailService from './EmailService';
import AllowControllerWithNoBearer from './allowControllerWithNoBearer';

@AllowControllerWithNoBearer()
@Controller('email')
export default class EmailController {
    /**
     *
     * @param emailService
     */
    constructor(private readonly emailService: EmailService) {}

    /**
     *
     * @param subject
     * @param message
     */
    @Post()
    async sendEmail(@Body('subject') subject: string, @Body('message') message: string) {
        try {
            // Call the email service to send the email
            await this.emailService.sendEmail(subject, message);
            // Return a success response
            return { message: 'Email sent successfully' };
        } catch (error) {
            // Log the error for debugging
            console.error('Error sending email:', error);
            // Throw an HTTP exception with a 500 status code
            throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

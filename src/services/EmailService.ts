import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_PUBLIC_KEY = "ZNV1ev8vvQ_SP3FW_";
const EMAILJS_SERVICE_ID = "service_1smg92n";
const EMAILJS_TEMPLATE_ID = "template_0hezlka";

// Initialize EmailJS with your public key
emailjs.init(EMAILJS_PUBLIC_KEY);

interface EmailParams {
  [key: string]: string;
  to_email: string;
  to_name: string;
  password: string;
  confirmation_link: string;
}

export const EmailService = {
  async sendConfirmationEmail(email: string, password: string, name: string): Promise<void> {
    try {
      console.log('Starting email send process...');
      console.log('Configuration:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY
      });

      const confirmationLink = `${window.location.origin}/confirm-account?email=${encodeURIComponent(email)}`;
      
      const templateParams: EmailParams = {
        to_email: email,
        to_name: name,
        password: password,
        confirmation_link: confirmationLink,
      };

      console.log('Template parameters:', templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Email sent successfully:', response);
    } catch (error: any) {
      console.error('Detailed error when sending email:', error);
      
      // Check for specific error types
      if (error.status === 412) {
        throw new Error('Gmail authentication required. Please configure Gmail service in EmailJS dashboard.');
      } else if (error.status === 400) {
        throw new Error('Invalid template parameters or service configuration.');
      } else if (error.status === 403) {
        throw new Error('Invalid EmailJS credentials. Please check your Public Key.');
      } else {
        throw new Error(`Failed to send confirmation email: ${error.text || 'Unknown error'}`);
      }
    }
  }
}; 
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getEmailContent } from "./emailTemplates";

const sesClient = new SESClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendEmail({ templateId, userId, email, to, data = {}, configurationSetName }) {
  console.log('data is', data)
  const emailAddress = to || email; // Support both 'to' and 'email' parameters
  const { subject, html, text } = getEmailContent(templateId, { ...data, email: emailAddress });

  try {
    const params = {
      Destination: {
        ToAddresses: [emailAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
          Text: {
            Charset: "UTF-8",
            Data: text || html.replace(/<[^>]*>/g, ''), // Fallback to plain text if no text provided
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: '"ExpertResume" <support@expertresume.us>',
      ReplyToAddresses: ["support@expertresume.us"],
    };

    // Add configuration set if provided
    if (configurationSetName) {
      params.ConfigurationSetName = configurationSetName;
    }

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log('[AWS SES] Email sent successfully:', result.MessageId);
    return {
      success: true,
      messageId: result.MessageId,
      email: emailAddress
    };
  } catch (error) {
    console.error('[AWS SES] Email send failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

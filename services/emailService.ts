import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "eu-central-1" });

export const handler = async (event) => {
  try {
    // Parse the incoming body
    const { to = "bouazza.medyt2@gmail.com", subject, body } = JSON.parse(event.body);

    const params = {
      Source: "bouazza.medyt@gmail.com", // Verified sender
      Destination: {
        ToAddresses: [to], // Use "to" from request (defaults to your verified recipient)
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: body },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const data = await client.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",   // Allow all origins
        "Access-Control-Allow-Headers": "*",  // Allow all headers
        "Access-Control-Allow-Methods": "OPTIONS,POST", // Allow methods
      },
      body: JSON.stringify({ message: "Email sent!", data }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

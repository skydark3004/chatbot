const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
//const request = require("request");
const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
console.log(PAGE_ACCESS_TOKEN);
console.log(VERIFY_TOKEN);

exports.test = (req, res, next) => {
  res.send("hello");
};

exports.getWebHook = (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

exports.postWebHook = (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log("Sender PSID: " + senderPsid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

function handleMessage(senderPsid, receivedMessage) {
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API
    response = {
      text: `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`,
    };
  } else if (receivedMessage.attachments) {
    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachmentUrl,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {
  // The page access token we have generated in your app settings

  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, _res, _body) => {
      if (!err) {
        console.log("Message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

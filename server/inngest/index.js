const { Inngest } = require("inngest");
const User = require("../models/User");
const Connection = require("../models/Connection");
const { FRONTEND_URL } = require("../utils/constants");
const sendEmail = require("../configs/nodemailer");

// Create a client to send and receive events
const inngest = new Inngest({ id: "Connect" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },

  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      let username = email_addresses[0].email_address.split("@")[0];

      const user = await User.findOne({ username });

      if (user) {
        username = username + Math.floor(Math.random() * 10000);
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: first_name + " " + last_name,
        profile_picture: image_url,
        username,
      };

      await User.create(userData);
    } catch (err) {
      console.log(err);
    }
  },
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", triggers: [{ event: "clerk/user.updated" }] },

  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const updatedUserData = {
        email: email_addresses[0].email_address,
        full_name: first_name + " " + last_name,
        profile_picture: image_url,
      };

      await User.findByIdAndUpdate(id, updatedUserData);
    } catch (err) {
      console.log(err);
    }
  },
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", triggers: [{ event: "clerk/user.deleted" }] },

  async ({ event }) => {
    try {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
    } catch (err) {}
  },
);

const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    triggers: [{ event: "app/connection-request" }],
  },

  async ({ event, step }) => {
    const { connectionId } = event.data;
    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );
      const subject = `New Connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name}- @${connection.from_user_id.username}</p>
        <p>Click <a href="${FRONTEND_URL}/connections" style="color: #10b981;">here</a>to accept or reject the request</p>
  
        <br/>
        <p>Thanks,<br>PingUp - Stay Connected </p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      if (connection.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = `New Connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name}- @${connection.from_user_id.username}</p>
        <p>Click <a href="${FRONTEND_URL}/connections" style="color: #10b981;">here</a>to accept or reject the request</p>
  
        <br/>
        <p>Thanks,<br>PingUp - Stay Connected </p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder sent!" };
    });
  },
);

const deleteStory = inngest.createFunction(
  {
    id: "story-delete",
    triggers: [{ event: "app/story.delete" }],
  },
  async () => {},
);

// Create an empty array where we'll export future Inngest functions
const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
];

module.exports = { inngest, functions };

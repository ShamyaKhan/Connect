const { Inngest } = require("inngest");
const User = require("../models/User");

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

// Create an empty array where we'll export future Inngest functions
const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];

module.exports = { inngest, functions };

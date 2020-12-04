const io = require("socket.io-client");

export default class MetinetChatClient {
  constructor(endpoint = "wss://teach-vue-chat-server.glitch.me", title = "user") {
    this.title = title;
    this.socket = io(endpoint);

    this.auth = null;
    this.waitingForAuth = [];

    this.socket.on("connect", async () => {
      console.log("socket@connect", this.socket.id);
    });

    this.callbacks = {
      conversationCreated: () => {},
      participantAdded: () => {},
      participantRemoved: () => {},
      userCreated: () => {},

      messagePosted: () => {},
      messageDelivered: () => {},
      conversationSeen: () => {},

      messageReacted: () => {},
      messageEdited: () => {},
      messageDeleted: () => {},

      usersAvailable: () => {}
    };

    for (let eventName in this.callbacks) {
      this.socket.on("@" + eventName, async (data, ack) => {
        console.log(this.title, "on", "@" + eventName, data);
        this.callbacks[eventName](data);
        if (ack) {
          ack();
        }
      });
    }
  }

  on(eventName, callback) {
    this.callbacks[eventName] = callback;
  }

  requireAuth() {
    if (this.auth) {
      return Promise.resolve(this.auth);
    } else {
      return new Promise(resolve => {
        this.waitingForAuth.push(resolve);
      });
    }
  }

  ack(eventName, input) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(this.title, "emit", eventName, input);
        this.socket.emit(eventName, input, response => {
          console.log(this.title, "ack", eventName);

          if (response.code === "SUCCESS") {
            resolve(response.data);
          } else {
            reject(response.code);
          }
        });
      }, 0);
    });
  }

  authenticate(username, password) {
    return new Promise((resolve, reject) => {
      this.ack("@authenticate", {
        username,
        password
      })
        .then(({ username, token, picture_url }) => {
          this.auth = { username, token, picture_url };
          resolve(this.auth);
          for (let resolve of this.waitingForAuth) {
            resolve(this.auth);
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  async getUsers() {
    const { token } = await this.requireAuth();
    return this.ack("@getUsers", {
      token
    });
  }

  async getOrCreateOneToOneConversation(username) {
    const { token } = await this.requireAuth();

    return this.ack("@getOrCreateOneToOneConversation", {
      token,
      username
    });
  }

  async createManyToManyConversation(usernames) {
    const { token } = await this.requireAuth();

    return this.ack("@createManyToManyConversation", {
      token,
      usernames
    });
  }

  async postMessage(conversation_id, content) {
    const { token } = await this.requireAuth();

    return this.ack("@postMessage", {
      token,
      conversation_id,
      content
    });
  }

  async seeConversation(conversation_id, message_id) {
    const { token } = await this.requireAuth();

    return this.ack("@seeConversation", {
      token,
      conversation_id,
      message_id
    });
  }

  async reactMessage(conversation_id, message_id, reaction) {
    const { token } = await this.requireAuth();

    return this.ack("@reactMessage", {
      token,
      conversation_id,
      message_id,
      reaction
    });
  }

  async replyMessage(conversation_id, message_id, content) {
    const { token } = await this.requireAuth();

    return this.ack("@replyMessage", {
      token,
      conversation_id,
      message_id,
      content
    });
  }

  async getConversations() {
    const { token } = await this.requireAuth();

    return this.ack("@getConversations", {
      token
    });
  }

  async searchMessage(search) {
    const { token } = await this.requireAuth();

    return this.ack("@searchMessage", {
      token,
      search
    });
  }

  async editMessage(conversation_id, message_id, content) {
    const { token } = await this.requireAuth();

    return this.ack("@editMessage", {
      token,
      conversation_id,
      message_id,
      content
    });
  }

  async deleteMessage(conversation_id, message_id) {
    const { token } = await this.requireAuth();

    return this.ack("@deleteMessage", {
      token,
      conversation_id,
      message_id
    });
  }

  async addParticipant(conversation_id, username) {
    const { token } = await this.requireAuth();

    return this.ack("@addParticipant", {
      token,
      conversation_id,
      username
    });
  }

  async removeParticipant(conversation_id, username) {
    const { token } = await this.requireAuth();

    return this.ack("@removeParticipant", {
      token,
      conversation_id,
      username
    });
  }
}

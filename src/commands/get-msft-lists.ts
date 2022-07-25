import "isomorphic-fetch"; 
import {
  Client,
  ClientOptions,
} from "@microsoft/microsoft-graph-client";

const token = process.env.MSFT_KEY

const clientOptions: ClientOptions = {
  authProvider: {
    getAccessToken: async () => {
      return token;
    },
  },
};

(async () => {
  const client = Client.initWithMiddleware(clientOptions);
  const out = await client.api("/me/todo/lists").get();
  out.value.forEach((element) => {
    console.log(element.displayName);
  });
})();

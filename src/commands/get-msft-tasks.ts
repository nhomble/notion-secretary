import "isomorphic-fetch";
import { Client, ClientOptions } from "@microsoft/microsoft-graph-client";

const token = process.env.MSFT_KEY;
const list = process.argv[2];

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
  let msftList = null;
  out.value.forEach((element) => {
    if (element.displayName === list) {
      msftList = element;
    }
  });

  console.log(msftList);
  console.log("***");
  const tasks = await client.api(`/me/todo/lists/${msftList.id}/tasks`).get();
  tasks.value.forEach((element) => {
    if (element.status !== "completed") {
      console.log(element);
    }
  });
})();

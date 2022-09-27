import {Client} from "@microsoft/microsoft-graph-client";
import {TokenCredentialAuthenticationProvider} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import "isomorphic-fetch"; // or import the fetch polyfill you installed
import {ClientSecretCredential} from "@azure/identity";

const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/offline_access", "https://graph.microsoft.com/Tasks.ReadWrite", "https://graph.microsoft.com/User.Read", "https://graph.microsoft.com/Tasks.Read"],
});

const msft = Client.initWithMiddleware({
  defaultVersion: "v1.0",
  debugLogging: true,
  authProvider,
});

(async () => {
  const lists = await msft.api("/me/todo/lists").get();
  console.log(lists);
})();

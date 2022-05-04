import {Client} from "@notionhq/client";
import {SearchResponse} from "@notionhq/client/build/src/api-endpoints";

const token = process.env.NOTION_KEY
const findAllDatabases = async function (): Promise<SearchResponse> {
  return notion.search({
    filter: {
      property: "object",
      value: "database",
    }
  });
};

// Initializing a client
const notion = new Client({
  auth: token,
});
(async () => {
  const databases = await findAllDatabases();
  for(const d of databases.results){
    console.log(`id=${d.id} - title=${d["title"][0]["plain_text"]}`);
  }
})();


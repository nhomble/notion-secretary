import {Client} from "@notionhq/client";
import {getDatabaseIds} from "..";

const token = process.env.NOTION_KEY;
const controlDbId = process.argv[2];

const notion = new Client({
  auth: token,
});

(async () => {
  const ids = await getDatabaseIds(notion, controlDbId);
  const resp = await notion.databases.query({
    database_id: ids.contexts,
  });
  for (const ctx of resp.results) {
    const page = await notion.pages.retrieve({
      page_id: ctx.id
    });
    console.log(`id=${ctx.id} - title=${page["properties"]["Name"]["title"][0]["plain_text"]}`);
  }
})();

import { Client } from "@notionhq/client";
import { getDatabaseIds } from "..";

const token = process.env.NOTION_KEY;
const database_id = process.argv[2];

const notion = new Client({
  auth: token,
});

(async () => {
  const now = new Date();
  const dbs = await getDatabaseIds(notion, database_id);
  const rows = await notion.databases.query({
    database_id: dbs.tasks,
    sorts: [
      {
        timestamp: "created_time",
        direction: "descending",
      },
    ],
    filter: {
      and: [
        { date: { on_or_before: now.toISOString() }, property: "Start" },
        { date: { is_not_empty: true }, property: "Start" },
        { checkbox: { equals: false }, property: "Done" }
      ],
    },
  });
  console.log(rows);

  const ele = rows.results[0];
  const page_id = ele.id;
  return notion.pages
    .retrieve({
      page_id: page_id,
    })
    .then((p) => {
      console.log(p["properties"].Name.title[0].plain_text);
    });
})();

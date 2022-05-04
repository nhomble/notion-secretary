import {Client} from "@notionhq/client";

const token = process.env.NOTION_KEY
const database_id = process.argv[2];
const task_name = process.argv.slice(3).join(" ");

const notion = new Client({
  auth: token,
});

(async () => {
  const db_props = await notion.databases.retrieve({
    database_id: database_id,
  }).then(d => {
    return d;
  });
  const rows = await notion.databases.query({
    database_id: database_id,
    sorts: [{
      timestamp: "created_time",
      direction: "descending",
    }],
    filter: {
      rich_text: { equals: task_name },
      property: "Name",
    }
  });
  const ele = rows.results[0];
  const page_id = ele.id;
  return notion.pages.retrieve({
    page_id: page_id,
  }).then(p => {
    console.log(p["properties"].Name.title[0].plain_text);
  });
})();

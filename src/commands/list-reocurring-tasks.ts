import {Client} from "@notionhq/client";

const token = process.env.NOTION_KEY
const database_id = process.argv[2];
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
  });
  rows.results.forEach(ele => {
    const page_id = ele.id;
    notion.pages.retrieve({
      page_id: page_id,
    }).then(p => {
      console.log(`task=${p["properties"].Name.title[0].plain_text} frequency=${p["properties"].Frequency.multi_select[0].name}`);
    });;
  });
})();

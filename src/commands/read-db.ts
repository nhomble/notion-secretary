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
  console.log(`id of Name is ${db_props.properties["Name"].id}`);
  console.log(db_props.properties["Context"]["multi_select"].options);
  const rows = await notion.databases.query({
    database_id: database_id,
  });
  rows.results.forEach(ele => {
    const page_id = ele.id;
    notion.pages.retrieve({
      page_id: page_id,
    }).then(p => {
      console.log(p["properties"].Context);
      const o = p["properties"].Context.multi_select;
      const context = (o.length == 0) ? "" : o[0].name;
      console.log(`${p["properties"].Name.title[0].plain_text} - ${context}`);
    });;
  });
})();

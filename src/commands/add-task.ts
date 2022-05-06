import {Client} from "@notionhq/client";
import {CreatePageParameters} from "@notionhq/client/build/src/api-endpoints";
import {getDatabaseIds} from "..";

const token = process.env.NOTION_KEY
const control_db_id = process.env.NOTION_CONTROL_DB;
const task_name = process.argv.slice(2).join(" ");
const notion = new Client({
  auth: token,
});

(async () => {
  const ids = await getDatabaseIds(notion, control_db_id);
  const insert: CreatePageParameters = {
    parent: {
      database_id: ids.tasks,
    },
    properties: {
      "Name": {
        type: "title",
        title: [
          {
            type: "text",
            text: {content: task_name},
          },
        ],
      }
    }
  }
  return notion.pages.create(insert);
})();

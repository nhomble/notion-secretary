
import {Client} from "@notionhq/client";
import {CreatePageParameters} from "@notionhq/client/build/src/api-endpoints";


const token = process.env.NOTION_KEY;
const database_id = process.argv[2];
const notion = new Client({
  auth: token,
});
(async () => {
  const insert: CreatePageParameters = {
    parent: {
      database_id: database_id,
      type: "database_id"
    },
    properties: {
      "Name": {
        type: "title",
        title: [
          {
            type: "text",
            text: {content: "hello!"},
          },
        ],
      }
    }
  };
  notion.pages.create(insert);
})();


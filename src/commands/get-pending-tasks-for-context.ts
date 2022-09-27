import {Client} from "@notionhq/client";
import {getPendingTasksForContextId} from '../index';


const token = process.env.NOTION_KEY;
const database_id = process.argv[2];
const notion = new Client({
  auth: token,
});
(async () => {
  const out = await getPendingTasksForContextId(notion, database_id);
  console.log(out);
})();


import {Client} from "@notionhq/client";
import {getDatabaseIds, getPendingTasksForContextId} from "..";

const token = process.env.NOTION_KEY;
const controlDbId = process.argv[2];

const notion = new Client({
  auth: token,
});

const isTaskComplete = async (notion: Client, task) => {
  return notion.pages.retrieve({page_id: task.id}).then((p) => {
    return {
      task: task,
      checked: p["properties"]["Done"].checkbox,
    };
  });
};

const cleanContext = async (notion: Client, contextId: string) => {
  const pendingTaskIds = await getPendingTasksForContextId(notion, contextId);
  const completed = await Promise.all(
    pendingTaskIds.map((r) => isTaskComplete(notion, r))
  );
  const cleaned = pendingTaskIds.filter((ele, i) => {
    return completed[i].checked === false;
  });

  return notion.pages.update({
    page_id: contextId,
    properties: {
      "Pending Tasks": {
        relation: cleaned,
      },
    },
  });
};

(async () => {
  const ids = await getDatabaseIds(notion, controlDbId);
  const resp = await notion.databases.query({
    database_id: ids.contexts,
  });
  for (const ctx of resp.results) {
    await cleanContext(notion, ctx.id);
  }
})();

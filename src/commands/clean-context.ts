import { Client } from "@notionhq/client";
import { getDatabaseIds, Ids } from "..";

const token = process.env.NOTION_KEY;
const controlDbId = process.argv[2];

const notion = new Client({
  auth: token,
});

const isTaskComplete = async (notion: Client, task) => {
  return notion.pages.retrieve({ page_id: task.id }).then((p) => {
    return {
      task: task,
      checked: p["properties"]["Done"].checkbox,
    };
  });
};

const cleanContext = async (notion: Client, contextId: string) => {
  const ctx = await notion.pages.retrieve({
    page_id: contextId,
  });
  const relations = ctx["properties"]["Pending Tasks"].relation;
  const completed = await Promise.all(
    relations.map((r) => isTaskComplete(notion, r))
  );
  const cleaned = relations.filter((ele, i) => {
    return completed[i].checked === false;
  });

  if (cleaned.length !== relations.length) {
    console.log(cleaned);
  }

  // return notion.pages.update({
  //   page_id: ctx.id,
  //   properties: {
  //     "Pending Tasks": {
  //       relation: cleaned,
  //     },
  //   },
  // });
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

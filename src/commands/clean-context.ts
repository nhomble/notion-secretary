import { Client } from "@notionhq/client";
import { pipe } from "fp-ts/lib/function";
import { getDatabaseIds, Ids } from "..";
import * as TE from "fp-ts/TaskEither";
import { ap } from "fp-ts/lib/Identity";
import { not } from "fp-ts/lib/Predicate";

const token = process.env.NOTION_KEY;
const controlDbId = process.argv[2];

const notion = new Client({
  auth: token,
});

const isTaskComplete = async (notion: Client, task) => {
  return notion.pages.retrieve({ page_id: task.id }).then((p) => {
    return {
      task: task,
      checked: Boolean(p["properties"]["Done"].checkbox),
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
    const c = completed[i];
    console.log(`${typeof c.checked} ${c.checked}`);
    if(c.checked){
      console.log("IF");
    }
    return !completed[i.checked];
  });

  console.log(cleaned);
  // const out = await notion.pages.update({
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
    break;
  }
})();

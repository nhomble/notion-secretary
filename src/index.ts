import {Client} from "@notionhq/client";

export type Ids = {
  tasks: string,
  contexts: string,
  reoccuring: string,
};

export const getPendingTasksForContextId = async (notion: Client, contextId: string) => {
  const ctx = await notion.pages.retrieve({
    page_id: contextId,
  });
  const relations = ctx["properties"]["Pending Tasks"].relation;
  return relations; 
}

export const getDatabaseIds = async (notion: Client, control_db_id: string): Promise<Ids> => {
  return notion.databases.query({
    database_id: control_db_id,
  }).then(resp => {
    const ret = {};
    const m = {
      TASKS_DB: "tasks",
      CONTEXTS_DB: "contexts",
      REOCURRING_DB: "reoccuring",
    };
    resp.results.forEach(row => {
      const props = row["properties"];
      const db = props.Name.title[0].plain_text;
      const id = props.Id.rich_text[0].plain_text;
      const key = m[db];
      ret[key] = id;
    });
    return ret as Ids;
  });
};



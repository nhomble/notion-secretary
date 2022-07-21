import {Client} from "@notionhq/client";
import {CreatePageParameters, QueryDatabaseResponse} from "@notionhq/client/build/src/api-endpoints";
import {getDatabaseIds} from "..";

const LOOK_AHEAD = 5;
const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

const token = process.env.NOTION_KEY
const control_db_id = process.argv[2];

const notion = new Client({
  auth: token,
});
const INTERVALS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

type Task = {
  task: string,
  frequency: "daily" | "weekly" | "monthly",
};

/**
 * get all reocurring tasks
*/
const getTasks = async function (dbId: string): Promise<Array<Task>> {
  return notion.databases.retrieve({
    database_id: dbId,
  }).then(async db => {
    const rows = await notion.databases.query({
      database_id: db.id
    });
    const ret = [];
    for (const row of rows.results) {
      const page = await notion.pages.retrieve({
        page_id: row.id,
      })
      ret.push({
        task: page["properties"].Name.title[0].plain_text,
        frequency: page["properties"].Frequency.multi_select[0].name,
      });
    }
    return ret;
  });
};

/**
 * find (if possible) latest schedule of task
*/
const findTask = async function (dbId: string, task: string): Promise<QueryDatabaseResponse> {
  return notion.databases.query({
    database_id: dbId,
    sorts: [
      {
        property: "Start",
        direction: "descending",
      }
    ],
    filter: {
      rich_text: {
        equals: task,
      },
      property: "Name",
    }
  });
};

/**
 * a filter to determine if a reoccuring task needs to be scheduled
*/
const shouldSchedule = function (schedule: Task, task: QueryDatabaseResponse): boolean {
  if (task.results.length == 0) {
    return true;
  } else {
    const latest = task.results[0];
    if (latest["properties"].Start.date === null) {
      return true;
    }

    const start_date = latest["properties"].Start.date.start;
    if (start_date === undefined || start_date === null) {
      return true;
    }
    // we lookahead in order to give myself time to schedule
    const now = Date.now();
    const curr = new Date(start_date);
    const frequency_interval = INTERVALS[schedule.frequency] * MILLIS_PER_DAY;
    const schedule_to_date = new Date(now + (MILLIS_PER_DAY * LOOK_AHEAD));
    const next_date = new Date(curr.getTime() + frequency_interval);
    return next_date < schedule_to_date;
  }
};

/**
 * determine date of the new task to be scheduled
*/
const pickNextDate = function (schedule: Task, task: QueryDatabaseResponse): Date {
  const today = new Date();
  if (task.results.length == 0) {
    return today;
  } else {
    const latest = task.results[0];
    if (latest["properties"].Start.date === null) {
      return today;
    }
    const start_date = latest["properties"].Start.date.start;
    if (start_date === undefined || start_date === null) {
      return today;
    }

    const frequency_interval = INTERVALS[schedule.frequency] * MILLIS_PER_DAY;
    return new Date((new Date(start_date)).getTime() + frequency_interval);
  }
};

(async () => {
  const ids = await getDatabaseIds(notion, control_db_id);
  const reoccuring = await getTasks(ids.reoccuring);
  for (const task of reoccuring) {
    const found = await findTask(ids.tasks, task.task);
    if (shouldSchedule(task, found)) {
      const next_date = pickNextDate(task, found);
      const insert: CreatePageParameters = {
        parent: {
          database_id: ids.tasks,
          type: "database_id"
        },
        properties: {
          "Name": {
            type: "title",
            title: [
              {
                type: "text",
                text: {content: task.task},
              }
            ],
          },
          "Start": {
            type: "date",
            date: {
              start: next_date.toISOString(),
              time_zone: "America/New_York",
            },
          },
          "Repeats?": {
            type: "checkbox",
            checkbox: true
          }
        }
      };
      await notion.pages.create(insert);
    }
  }
})();

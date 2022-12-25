import { Client } from "@notionhq/client";
const QuickChart = require("quickchart-js");
import * as img from "imgur";

const token = process.env.NOTION_KEY;
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const IMGUR_CLIENT_SECRET = process.env.IMGUR_CLIENT_SECRET;

const charts_db_id = process.argv[2];
const notion = new Client({
  auth: token,
});
const imgur = new img.ImgurClient({
    clientId: IMGUR_CLIENT_ID,
    clientSecret: IMGUR_CLIENT_SECRET,
});

(async () => {
  return notion.databases
    .query({
      database_id: charts_db_id,
    })
    .then((resp) => {
      return resp.results.map((result) => ({
        key: result["properties"]["Key"].rich_text[0].plain_text,
        image_id: result["properties"]["Image Id"].rich_text[0].plain_text,
        database_id:
          result["properties"]["Timeseries Database Id"].title[0].plain_text,
      }));
    })
    .then((charts) => {
      charts.forEach((chart) => processChart(chart));
    });
})();

const processChart = async (data: {
  key: string;
  database_id: string;
  image_id: string;
}) => {
  // TODO iteratePaginatedAPI
  const points = await notion.databases
    .query({
      database_id: data.database_id,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    })
    .then((out) => {
      return out.results.map((result) => ({
        value: result["properties"][data.key].title[0].plain_text,
        time: result["properties"]["Time"].created_time,
      }));
    });
  const chart = new QuickChart();
  chart.setConfig({
    type: "line",
    data: {
      datasets: [
        {
          data: points.map((p) => ({
            x: `${p.time}`,
            y: +p.value,
          })),
          label: data.key,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              parser: "YYYY-MM-DDThh:mm:ssZ",
            },
            displayFormats: {
              day: "MMM DD YYYY",
            },
          },
        ],
      },
    },
  });
  const imgurResponse = await imgur.upload({
    image: chart.getUrl()
  })
  const imgurLink = imgurResponse["data"]["link"]

  const curr = await notion.blocks.retrieve({
    block_id: data.image_id
  })
  const imgurDelete = curr["image"]["caption"][0]["text"]["content"]
  await imgur.deleteImage(imgurDelete).catch(err => { /* best effort */ })

  await notion.blocks.update({
    type: "image",
    block_id: data.image_id,
    image: {
        external: {
            url: imgurLink
        },
        caption: [
            { type: "text", text: { content: `${imgurResponse["data"]["deletehash"]}`}}
        ]
    }
  })
};

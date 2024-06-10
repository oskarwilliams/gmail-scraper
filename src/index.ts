import { json2csv } from "json-2-csv";
import { FROM_DATES, TO_DATES, EMAILS } from "./config.js";
import { scrapeMetricsForUser } from "./scrape-metrics.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const scrapeAndSave = async (fromDate: string, toDate: string) => {
  const resultsPromise = EMAILS.map(
    async (userId) => await scrapeMetricsForUser(userId, fromDate, toDate),
  );

  const results = await Promise.all(resultsPromise);
  const csv = json2csv(results);

  const dataDir = "./data";

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
  }
  writeFileSync(`${dataDir}/results-${fromDate}-${toDate}.csv`, csv);
  console.log(`Saved results for ${fromDate} to ${toDate}`);
};

const main = async () => {
  const fromDates = FROM_DATES;
  const toDates = TO_DATES;
  if (fromDates.length !== toDates.length) {
    throw new Error("FROM_DATES and TO_DATES must have the same length");
  }

  for (let i = 0; i < fromDates.length; i++) {
    await scrapeAndSave(fromDates[i], toDates[i]);
  }
};

main();

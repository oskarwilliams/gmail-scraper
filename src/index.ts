import { json2csv } from "json-2-csv";
import { FROM_DATES, TO_DATES, EMAILS } from "./config.js";
import { scrapeMetricsForUser } from "./scrape-metrics.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const scrape = async (fromDate: string, toDate: string) => {
  const resultsPromise = EMAILS.map(
    async (userId) => await scrapeMetricsForUser(userId, fromDate, toDate),
  );

  const results = await Promise.all(resultsPromise);
  console.log(`Scraped results for ${fromDate} to ${toDate}`);
  return results;
};

const main = async () => {
  const fromDates = FROM_DATES;
  const toDates = TO_DATES;
  if (fromDates.length !== toDates.length) {
    throw new Error("FROM_DATES and TO_DATES must have the same length");
  }
  const firstFromDate = fromDates[0];
  const lastToDate = toDates[toDates.length - 1];

  const results = [];

  for (let i = 0; i < fromDates.length; i++) {
    results.push(...(await scrape(fromDates[i], toDates[i])));
  }
  const csv = json2csv(results);

  const dataDir = "./data";

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
  }
  writeFileSync(`${dataDir}/results-${firstFromDate}-${lastToDate}.csv`, csv);
  console.log(
    "Results saved to",
    `${dataDir}/results-${firstFromDate}-${lastToDate}.csv`,
  );
};

main();

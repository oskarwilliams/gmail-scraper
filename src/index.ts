import { json2csv } from "json-2-csv";
import { AFTER_DATE, BEFORE_DATE, EMAILS } from "../config.js";
import { scrapeMetricsForUser } from "./scrape-metrics.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const main = async () => {
  const afterDate = AFTER_DATE;
  const beforeDate = BEFORE_DATE;

  const resultsPromise = EMAILS.map(
    async (userId) => await scrapeMetricsForUser(userId, beforeDate, afterDate),
  );

  const results = await Promise.all(resultsPromise);
  const csv = json2csv(results);

  const dataDir = "./data";

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
  }
  writeFileSync(`${dataDir}/results-${beforeDate}-${afterDate}.csv`, csv);
};

main();

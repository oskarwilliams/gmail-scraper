import { json2csv } from "json-2-csv";
import { FROM_DATE, TO_DATE, EMAILS } from "./config.js";
import { scrapeMetricsForUser } from "./scrape-metrics.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const main = async () => {
  const fromDate = FROM_DATE;
  const toDate = TO_DATE;

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
};

main();

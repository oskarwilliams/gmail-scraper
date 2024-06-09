import { AFTER_DATE, BEFORE_DATE, EMAIL } from "../config.js";
import { scrapeMetricsForUser } from "./scrape-metrics.js";

const main = async () => {
  const afterDate = AFTER_DATE;
  const beforeDate = BEFORE_DATE;
  const userId = EMAIL;

  const results = await scrapeMetricsForUser(userId, beforeDate, afterDate);
  console.log(results);
};

main();

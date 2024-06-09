import "dotenv/config";

export const EMAILS = (process.env.EMAILS ?? "").split(",");
export const AFTER_DATE = process.env.AFTER_DATE ?? "";
export const BEFORE_DATE = process.env.BEFORE_DATE ?? "";

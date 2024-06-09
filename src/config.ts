import "dotenv/config";

export const EMAILS = (process.env.EMAILS ?? "").split(",");
export const FROM_DATE = process.env.FROM ?? "";
export const TO_DATE = process.env.TO ?? "";

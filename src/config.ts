import "dotenv/config";

export const EMAILS = (process.env.EMAILS ?? "").split(",");
export const FROM_DATES = (process.env.FROM_DATES ?? "").split(",");
export const TO_DATES = (process.env.TO_DATES ?? "").split(",");

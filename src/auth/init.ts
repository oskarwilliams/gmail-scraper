import { google } from "googleapis";

export const getGmailApi = async (delegateEmail: string) => {
  const auth = new google.auth.JWT({
    subject: delegateEmail,
    keyFile: "src/auth/service-key.json",
    scopes: ["https://mail.google.com/"],
  });
  await auth.authorize();

  return google.gmail({ version: "v1", auth });
};

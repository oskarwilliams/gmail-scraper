import { gmail_v1 } from "googleapis";
import { sum } from "radash";
import { getGmailApi } from "./auth/init";

export const scrapeMetricsForUser = async (
  userId: string,
  fromDate: string,
  toDate: string,
) => {
  let late24hrReply = 0;
  let late72hrReply = 0;

  const gmailClient = await getGmailApi(userId);

  const isReceivedMessage = (message: gmail_v1.Schema$Message) => {
    const headers = message.payload?.headers ?? [];

    return Boolean(
      headers.find(({ name }) => name === "From")?.value?.includes(userId),
    );
  };

  const isNotReplyMessage = (message: gmail_v1.Schema$Message) => {
    return !isReceivedMessage(message);
  };

  const threadListRequest = await gmailClient.users.threads.list({
    userId,
    maxResults: 500,
    q: " after:" + fromDate + " before:" + toDate,
  });

  const threadList = threadListRequest.data.threads ?? [];

  if (threadListRequest.data.nextPageToken) {
    const nextThreadListRequest = await gmailClient.users.threads.list({
      userId,
      maxResults: 500,
      q: " after:" + fromDate + " before:" + toDate,
      pageToken: threadListRequest.data.nextPageToken,
    });

    threadList.push(...(nextThreadListRequest.data.threads ?? []));

    if (nextThreadListRequest.data.nextPageToken) {
      throw new Error("Too many threads to process");
    }
  }

  const threadDetailsPromises = threadList.map(async ({ id }) => {
    if (!id) {
      return {};
    }

    const threadRequest = await gmailClient.users.threads.get({
      userId,
      id,
    });
    const messages = threadRequest.data.messages ?? [];

    let replyTimeInHrs: undefined | number = undefined;
    if (messages.length >= 2) {
      const mostRecentMessage = messages[messages.length - 1];
      if (isReceivedMessage(mostRecentMessage)) {
        const lastSentMessage = messages[messages.length - 2];

        if (
          !mostRecentMessage?.internalDate ||
          !lastSentMessage?.internalDate
        ) {
          return {};
        }

        replyTimeInHrs =
          (parseInt(mostRecentMessage?.internalDate) -
            parseInt(lastSentMessage?.internalDate)) /
          (60 * 60 * 1000);

        if (replyTimeInHrs > 24) {
          late24hrReply++;
        }

        if (replyTimeInHrs > 72) {
          late72hrReply++;
        }
      }
    }
    return {
      numberOfSentEmails: messages.filter(isNotReplyMessage).length,
      numberOfReceivedEmails: messages.filter(isReceivedMessage).length,
      replyTimeInHrs,
    };
  });

  const threadDetails = await Promise.all(threadDetailsPromises);

  const totalSentEmails = sum(threadDetails, (t) => t.numberOfSentEmails ?? 0);
  const totalReceivedEmails = sum(
    threadDetails,
    (t) => t.numberOfReceivedEmails ?? 0,
  );
  const totalEmailsWithReplyTimeCalculated = threadDetails.filter(
    ({ replyTimeInHrs }) => replyTimeInHrs !== undefined,
  ).length;
  const avgReplyTime =
    sum(threadDetails, (t) => t.replyTimeInHrs ?? 0) /
    totalEmailsWithReplyTimeCalculated;

  return {
    userId, // Email Account
    afterDate: fromDate, // Date after
    beforeDate: toDate, // Date before
    totalSentEmails, // Emails Sent
    totalReceivedEmails, // Emails Received
    avgReplyTime, // Reply Time in Hours
    late24hrReply, // Replies outside 24 hours
    late72hrReply, // Replies outside 72 hours
  };
};

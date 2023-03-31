import logger from 'logger';
import { crawlFithouService } from 'services/fithou';
import { sendMessage } from 'services/facebook';

export const crawlFithouJob = async () => {
  const result = await crawlFithouService();

  const subscribers = result.subscribedIDs;

  if (!result?.data) {
    logger.warn(`There is not an article in the db`);
    return;
  }

  if (result.code === 'ONE_NEW_ARTICLE') {
    for (const userId of subscribers) {
      if (!Array.isArray(result.data)) {
        sendMessage(userId, {
          text: `${result?.data?.title} \n ${result?.data?.link}`,
        });
      }
    }
  }

  if (result.code === 'MANY_NEW_ARTICLES') {
    if (Array.isArray(result.data)) {
      for (const userId of subscribers) {
        for (let j = 0; j < result.data?.length; j++) {
          sendMessage(userId, {
            text: `${result?.data[j]?.title} \n ${result?.data[j]?.link}`,
          });
        }
      }
    }
  }
  logger.info(`crawlFithouJob is running at ${new Date()}`);
};

/* eslint-disable @typescript-eslint/no-loop-func */
import logger from 'logger';
import { crawlFithouService } from 'services/fithou';
import { workerTs } from 'workers';
import { Worker } from 'worker_threads';
import path from 'path';
import { createPool } from 'generic-pool';

const workerPath = path.join(__dirname, '../workers/newsHunter.ts');

export const crawlFithouJob = async () => {
  const result = await crawlFithouService();

  const subscribers = result.subscribedIDs;

  if (!result?.data) {
    logger.warn(`There is not an article in the db`);
    return;
  }

  if (result.code === 'ONE_NEW_ARTICLE') {
    for (const userId of subscribers) {
      const workerFactory: any = {
        create: () => workerTs(workerPath, { workerData: { userId: userId, data: result.data } }),
        destroy: (worker: any) => worker.terminate(),
      };

      const pool = createPool(workerFactory, { max: 4 });
      const worker = (await pool.acquire()) as Worker;

      worker.on('message', function (message: any) {
        console.log(message);
        pool.release(worker);
      });

      worker.on('error', (error: any) => {
        console.error(`Lỗi từ worker cho ${userId}:`, error);
        pool.release(worker);
      });

      await pool.drain();
      await pool.clear();
    }
  }

  if (result.code === 'MANY_NEW_ARTICLES') {
    if (Array.isArray(result.data)) {
      for (const userId of subscribers) {
        for (let j = 0; j < result.data?.length; j++) {
          const workerFactory: any = {
            create: () =>
              workerTs(workerPath, {
                workerData: { userId: userId, data: Array.isArray(result.data) && result.data[j] },
              }),
            destroy: (worker: any) => worker.terminate(),
          };

          const pool = createPool(workerFactory, { max: 4 });
          const worker = (await pool.acquire()) as Worker;

          worker.on('message', function (message: any) {
            console.log(message);
            pool.release(worker);
          });

          worker.on('error', (error: any) => {
            console.error(`Lỗi từ worker cho ${userId}:`, error);
            pool.release(worker);
          });

          await pool.drain();
          await pool.clear();
        }
      }
    }
  }
  logger.info(`crawlFithouJob is running at ${new Date()}`);
};

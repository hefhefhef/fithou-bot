import { sendMessage } from 'services/facebook';
import { workerData, parentPort } from 'worker_threads';

sendMessage(workerData.userId, {
  text: `${workerData?.data?.title} \n ${workerData?.data?.link}`,
});

parentPort.postMessage(`Send new articles to ${workerData.userId}`);

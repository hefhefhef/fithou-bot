import config from 'config';
import logger from 'logger';
import schedule from 'node-schedule';

const rule = new schedule.RecurrenceRule();
// your timezone
rule.tz = 'Asia/Ho_Chi_Minh';

rule.minute = config.jobs.fithou.second;

import { crawlFithouJob } from './crawlFithouJob';
import { examDaySchedule } from './examDay';
import { eveningSchedule, morningSchedule, noonSchedule } from './schoolSchedule';

const runjobs = () => {
  schedule.scheduleJob(rule, crawlFithouJob);

  schedule.scheduleJob('00 45 6 * * 0-6', morningSchedule);
  schedule.scheduleJob('00 00 12 * * 0-6', noonSchedule);
  schedule.scheduleJob('00 30 16 * * 0-6', eveningSchedule);
  schedule.scheduleJob('00 00 20 * * 0-6', examDaySchedule);
  logger.info('All jobs are running');
};

export default runjobs;

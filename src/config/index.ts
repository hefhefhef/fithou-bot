import dotenvSafe from 'dotenv-safe';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import path from 'path';
import fs from 'fs';

dotenv.config();
const pathEnv = path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`);
if (fs.existsSync(pathEnv)) {
  dotenvSafe.config({
    allowEmptyValues: true,
    path: pathEnv,
    sample: path.join(__dirname, '../../.env.example'),
  });
}

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  accessToken: process.env.FB_VERIFY_TOKEN,
  mongodb: {
    protocol: process.env.MONGODB_PROTOCOL,
    username: process.env.MONGODB_USERNAME,
    pasword: process.env.MONGODB_PASSWORD,
    host: process.env.MONGODB_HOST,
    replicaSet: process.env.MONGODB_REPLICA_SET,
    dbName: process.env.MONGODB_NAME,
  },
  service: {
    fithou: process.env.FITHOU_URL,
    ctms: process.env.CTMS_URL,
  },
  jobs: {
    fithou: {
      hour: process.env.FITHOU_JOB_HOUR,
      minute: process.env.FITHOU_JOB_MINUTE || 30,
      second: process.env.FITHOU_JOB_SECOND,
    },
    attendanceReminder: {
      webHookUrl:
        process.env.ATTENDANCE_REMINDER_WEBHOOK_URL ||
        'https://chat.googleapis.com/v1/spaces/AAAAB1jAqx4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=x6mJHCRxh5F5VCKo92MIElqUZ6yD4pEnhv6i6ZMq-Ik',
    },
  },
  auth: {
    key: process.env.AUTH_KEY,
  },
};

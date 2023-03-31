import logger from 'logger';
import { UserModel } from 'models';
import User from 'models/types/User';
import { fetchUpcomingExamSchedule } from 'api/v1/exam/service';

export const examDaySchedule = async () => {
  try {
    const users: User[] = await UserModel.find({ isExamDay: true });

    for (const user of users) {
      fetchUpcomingExamSchedule({
        username: user.username,
        password: user.password,
        subscribedID: user.subscribedID,
      });
    }
    logger.info(`examDaySchedule is running at ${new Date()}`);
  } catch (error) {
    logger.error(error);
  }
};

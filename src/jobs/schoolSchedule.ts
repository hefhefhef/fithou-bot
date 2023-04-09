/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from 'logger';
import { sendMessage } from 'services/facebook';
import { UserModel } from 'models';
import { schoolScheduleService } from 'services/ctms/schoolSchedule';

const message = (text: string, session: any[]) => {
  return `${text} nha:\n-----------------\nGiờ: ${session[1]}\nPhòng: ${session[2]}\nMôn học: ${session[3]}\nGiảng viên: ${session[4]}\nLớp: ${session[5]}`
}

export const morningSchedule = async () => {
  try {
    const users: any[] = await UserModel.find({ isTrackTimetable: true });
    for (const user of users) {
      const timeTable: any = await schoolScheduleService(user.username, user.password);

      if (timeTable.isExpired) { 
        
        await sendMessage(user.subscribedID, {
          text:'Tài khoản CTMS của bạn đã hết hạn, vui lòng gửi mail theo hướng dẫn để dùng tiếp dịch vụ nha!🥲',
        });

        logger.warn(`User ${user.username} is expired! ${new Date()}`);

        continue;
      }
      

      const sessionOne = timeTable?.sessionOne;
    
      if (sessionOne?.length > 0 && sessionOne[sessionOne?.length - 1] === 'Học') {
         await sendMessage(user.subscribedID, {
          text: message(`📝 Bạn có môn học vào buổi sáng`, sessionOne),
        });

        logger.warn(`User ${user.username} has a class in the morning! ${new Date()}`);
      }

      if (sessionOne?.length > 0 && sessionOne[sessionOne?.length - 1] === 'Học trực tuyến') {
         await sendMessage(user.subscribedID, {
          text: message(`📝 Bạn có môn học trực tuyến vào buổi sáng`, sessionOne),
        });

        logger.warn(`User ${user.username} has a online class in the morning! ${new Date()}`);
      }

      if (sessionOne?.length > 0 && sessionOne[sessionOne?.length - 1] === 'Nghỉ') {      
         await sendMessage(user.subscribedID, {
          text: message(`🆘🆘🆘 Môn học sáng nay của bạn đã bị hủy (hoặc nghỉ học)`, sessionOne),
        });

        logger.warn(`User ${user.username} class this morning has been canceled! ${new Date()}`);
      }

      if (sessionOne?.length > 0 && sessionOne[sessionOne?.length - 1] === 'Ngoại khoá') {
        await sendMessage(user.subscribedID, {
          text: message(`Bạn có một buổi học ngoại khoá`, sessionOne),
        });

        logger.warn(`User ${user.username} have an extra-curricular session! ${new Date()}`);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

export const noonSchedule = async () => {
  try {
    const users: any[] = await UserModel.find({ isTrackTimetable: true });
    for (const user of users) {
      const timeTable: any = await schoolScheduleService(user.username, user.password);

      if (timeTable.isExpired) { 
        
        await sendMessage(user.subscribedID, {
          text:'Tài khoản CTMS của bạn đã hết hạn, vui lòng gửi mail theo hướng dẫn để dùng tiếp dịch vụ nha!🥲',
        });

        logger.warn(`User ${user.username} is expired! ${new Date()}`);

        continue;
      }

      const sessionTwo = timeTable?.sessionTwo;

      if (sessionTwo?.length > 0 && sessionTwo[sessionTwo?.length - 1] === 'Học') {        
         await sendMessage(user.subscribedID, {
          text: message(`📝 Bạn có môn học vào buổi chiều`, sessionTwo),
        });

        logger.warn(`User ${user.username} has a class in the afternoon! ${new Date()}`);
      }
      
      if (sessionTwo?.length > 0 && sessionTwo[sessionTwo?.length - 1] === 'Học trực tuyến') {        
         await sendMessage(user.subscribedID, {
          text: message(`📝 Bạn có môn học trực tuyến vào buổi chiều`, sessionTwo),
        });

        logger.warn(`User ${user.username} has a online class in the afternoon! ${new Date()}`);
      }

      if (sessionTwo?.length > 0 && sessionTwo[sessionTwo?.length - 1] === 'Nghỉ') {        
         await sendMessage(user.subscribedID, {
          text: message(`🆘🆘🆘 Môn học chiều nay của bạn đã bị hủy (hoặc nghỉ học)`, sessionTwo),
        });

        logger.warn(`User ${user.username} class this afternoon has been canceled! ${new Date()}`);
      }

      if (sessionTwo?.length > 0 && sessionTwo[sessionTwo?.length - 1] === 'Ngoại khoá') {
        await sendMessage(user.subscribedID, {
          text: message(`Bạn có một buổi học ngoại khoá`, sessionTwo),
        });

        logger.warn(`User ${user.username} have an extra-curricular session! ${new Date()}`);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

export const eveningSchedule = async () => {
  try {
    const users: any[] = await UserModel.find({ isTrackTimetable: true });
    for (const user of users) {
      const timeTable: any = await schoolScheduleService(user.username, user.password);

      if (timeTable.isExpired) { 
        
        await sendMessage(user.subscribedID, {
          text:'Tài khoản CTMS của bạn đã hết hạn, vui lòng gửi mail theo hướng dẫn để dùng tiếp dịch vụ nha!🥲',
        });

        logger.warn(`User ${user.username} is expired! ${new Date()}`);

        continue;
      }

      const sessionThree = timeTable?.sessionThree;

      if (sessionThree?.length > 0 && sessionThree[sessionThree?.length - 1] === 'Học') {        
         await sendMessage(user.subscribedID, {
          text: message(`📝 Bạn có môn học vào buổi tối`, sessionThree),
        });

        logger.warn(`User ${user.username} has a class in the evening! ${new Date()}`);
      }

      if (sessionThree?.length > 0 && sessionThree[sessionThree?.length - 1] === 'Học trực tuyến') {        
         await sendMessage(user.subscribedID, {
          text: message(`📝 Bạn có môn học trực tuyến vào buổi tối`, sessionThree),
        });

        logger.warn(`User ${user.username} has a online class in the evening! ${new Date()}`);
      }

      if (sessionThree?.length > 0 && sessionThree[sessionThree?.length - 1] === 'Nghỉ') {
         await sendMessage(user.subscribedID, {
          text: message(`🆘🆘🆘 Môn học tối nay của bạn đã bị hủy (hoặc nghỉ học)`, sessionThree),
        });

        logger.warn(`User ${user.username} class this evening has been canceled! ${new Date()}`);

      }

      if (sessionThree?.length > 0 && sessionThree[sessionThree?.length - 1] === 'Ngoại khoá') {
        await sendMessage(user.subscribedID, {
          text: message(`Bạn có một buổi học ngoại khoá`, sessionThree),
        });

        logger.warn(`User ${user.username} have an extra-curricular session! ${new Date()}`);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};


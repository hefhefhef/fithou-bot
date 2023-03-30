import ServerErrorException from 'exceptions/ServerErrorException';
import logger from 'logger';
import ExamDayModel from 'models/schemas/ExamDay';
import ExamDayType from 'models/types/ExamDay';
import { ExamDay } from 'services/ctms/examDay';
import { sendMessage } from 'services/facebook';
import { ExamDayResponse, ExamType } from 'types';
import { calculateTheNumberOfDaysBetweenTwoDates, convertDate } from 'utils/constants';
import { FetchUpcomingExamScheduleRequest } from './dto';

const message = (text: string, examDay: ExamType) => {
  return `${text}:
-----------------
STT: ${examDay?.OrdinalNumbers}
Thời gian: ${examDay?.ExamTime}
Phòng thi: ${examDay?.ExamRoom}
Môn thi: ${examDay?.ExamSubject}
Mã DS thi: ${examDay?.CodeOfExamList}`;
};

const today = new Date();

interface FetchExamDataResponse {
  examDayResponse: ExamDayResponse;
  examDayData: ExamDayType;
}

const fetchExamData = async (input: FetchUpcomingExamScheduleRequest): Promise<FetchExamDataResponse> => {
  try {
    const examDayResponse: Promise<ExamDayResponse> = ExamDay(input.username, input.password);
    const examDayData = ExamDayModel.findOne({ username: input.username });
    const resolveAll: any = await Promise.all([examDayResponse, examDayData]);
    return {
      examDayResponse: resolveAll[0],
      examDayData: resolveAll[1],
    };
  } catch (error) {
    logger.error(`Error when fetch exam data: ${error}`);
  }
};

const sendMessageIfChanged = async (
  input: FetchUpcomingExamScheduleRequest,
  examDayData: ExamDayType,
  exam: ExamType
) => {
  try {
    let IS_SHOULD_UPDATE = false;
    const foundMissing = examDayData.dataSent.find((item) => item.ExamSubject === exam.ExamSubject);
    if (!foundMissing) {
      await sendMessage(input?.subscribedID, { text: message('Bạn có lịch thi 🥰', exam) });
      logger.warn(`User ${input.username} has a exam! ${new Date()}`);
    }

    const hasChanged = examDayData.dataSent.find(
      (item) => item.ExamSubject === exam.ExamSubject && item.ExamTime !== exam.ExamTime
    );
    if (hasChanged) {
      await sendMessage(input?.subscribedID, { text: message('Lịch thi của bạn đã thay đổi 😎', exam) });
      IS_SHOULD_UPDATE = true;
      logger.warn(`User ${input.username} exam has been changed! ${new Date()}`);
    }

    const hasChangedRoom = examDayData.dataSent.find(
      (item) => item.ExamSubject === exam.ExamSubject && item.ExamRoom !== exam.ExamRoom
    );
    if (hasChangedRoom) {
      await sendMessage(input?.subscribedID, { text: message('Phòng thi của bạn đã thay đổi 😜', exam) });
      IS_SHOULD_UPDATE = true;
      logger.warn(`User ${input.username} exam room has been changed! ${new Date()}`);
    }

    if (IS_SHOULD_UPDATE) {
      return {
        is_should_update: true,
      };
    }

    return {
      is_should_update: false,
    };
  } catch (error) {
    logger.error(`Error when send message if changed: ${error}`);
  }
};

const isExamTomorrow = (exam: ExamType, d: Date) => {
  try {
    const dateOfExam = new Date(convertDate(exam.ExamTime.split(' ')[1]));
    const numberOfDate = calculateTheNumberOfDaysBetweenTwoDates(dateOfExam, d);

    return numberOfDate === 1;
  } catch (error) {
    logger.error(`Error when check exam tomorrow: ${error}`);
  }
};

export const fetchUpcomingExamSchedule = async (input: FetchUpcomingExamScheduleRequest) => {
  try {
    const { examDayResponse, examDayData } = await fetchExamData(input);

    if (examDayResponse?.isExpired) {
      await sendMessage(input?.subscribedID, {
        text: 'Tài khoản CTMS của bạn đã hết hạn, vui lòng gửi mail theo hướng dẫn để dùng tiếp dịch vụ nha!🥲',
      });
      logger.warn(`User ${input.username} is expired!`);
    }

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await ExamDayModel.findOneAndUpdate(
      { username: input.username },
      { $set: { dataSent: examDayResponse?.data } },
      options
    );

    if (!examDayData) {
      for (let i = 0; i < examDayResponse?.data?.length; i++) {
        await sendMessage(input?.subscribedID, {
          text: message('Bạn có lịch thi 🥰', examDayResponse?.data[i]),
        });
        logger.warn(`User ${input.username} has a exam! ${new Date()}`);
      }

      return;
    }

    for (let i = 0; i < examDayResponse?.data?.length; i++) {
      await sendMessageIfChanged(input, examDayData, examDayResponse?.data[i]);

      const check = isExamTomorrow(examDayResponse?.data[i], today);
      if (check) {
        await sendMessage(input?.subscribedID, {
          text: message('Bạn có lịch thi ngày mai 😝', examDayResponse?.data[i]),
        });
        logger.warn(`User ${input.username} exam tomorrow ${new Date()}`);
      }
    }

    return examDayResponse;
  } catch (error) {
    logger.error(error);
    throw new ServerErrorException();
  }
};

import axios from 'axios';
import * as cheerio from 'cheerio';

import logger from 'logger';
import { EXAM_DAY_URL, EXPIRED_CTMS } from 'utils/constants';
import { loginCtms } from 'services/ctms/auth';
import { ExamDayResponse, ExamType } from 'types';
import { removeCtmsUserByEmail } from 'api/v1/users/service';
import { logoutAndRemoveCookie } from 'api/v1/cookies/service';

export const ExamDay = async (username: string, password: string, id?: string) => {
  try {
    const login = await loginCtms(username, password);
    const cookie = login?.cookie;

    if (login.isSuccess) {
      const dom = await axios.get(EXAM_DAY_URL, {
        headers: {
          Cookie: cookie,
        },
      });

      const $ = cheerio.load(dom.data);

      const expiredNotiText = $('#leftcontent #thongbao').text().trim();
      if (expiredNotiText === EXPIRED_CTMS) {
        const result: ExamDayResponse = {
          isExpired: true,
        };
        return result;
      }

      const data: string[] = [];
      const result: ExamType[] = [];

      $('.RowEffect tbody tr td').each(function (index, element) {
        const item = $(element).text().trim();
        data.push(item);
      });

      for (let i = 1; i < data.length / 5; i++) {
        const ordinalNumbers: string = data[i * 5];
        const examTime: string = data[i * 5 + 1];
        const examRoom: string = data[i * 5 + 2];
        const examSubject: string = data[i * 5 + 3];
        const codeOfExamList: string = data[i * 5 + 4];
        result.push({
          OrdinalNumbers: ordinalNumbers,
          ExamTime: examTime,
          ExamRoom: examRoom,
          ExamSubject: examSubject,
          CodeOfExamList: codeOfExamList,
        });
      }

      logoutAndRemoveCookie(login.cookie, username);

      const res: ExamDayResponse = {
        data: result,
      };

      return res;
    }

    if (login.isRemove) {
      await removeCtmsUserByEmail(
        username,
        'Tài khoản CTMS của bạn đã bị đổi mật khẩu, vui lòng đăng nhập lại để sử dụng dịch vụ nha!🥲'
      );
    }
  } catch (error) {
    logger.error(`[ExamDay] ${error}`);
  }
};

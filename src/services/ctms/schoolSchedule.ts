/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

import { loginCtms } from 'services/ctms';
import { EXPIRED_CTMS, SCHOOL_SCHEDULE_URL, todayformatted } from 'utils/constants';
import logger from 'logger';
import { removeCtmsUserByEmail } from 'api/v1/users/service';
import { formatDateTimeToGetTimetable } from 'utils';
import { logoutAndRemoveCookie } from 'api/v1/cookies/service';

const checkSession = (session: string) => {
  if (session.match('07:30')) {
    return 'Sáng';
  }

  if (session.match('13:00')) {
    return 'Chiều';
  }

  if (session.match('17:15')) {
    return 'Tối';
  }
};

export const schoolScheduleService = async (username: string, password: string) => {
  try {
    const login = await loginCtms(username, password);

    const cookie = login.cookie;

    if (login.isSuccess) {
      const date = formatDateTimeToGetTimetable();

      const data = qs.stringify({
        __EVENTTARGET: '',
        __EVENTARGUMENT: '',
        __VIEWSTATE:
          '/wEPDwUKMTA4NDM3NDc2OGQYBwUzY3RsMDAkTGVmdENvbCRMaWNoaG9jMSRycHRyTGljaGhvYyRjdGwwNSRncnZMaWNoaG9jDzwrAAwBCAIBZAUzY3RsMDAkTGVmdENvbCRMaWNoaG9jMSRycHRyTGljaGhvYyRjdGwwMyRncnZMaWNoaG9jDzwrAAwBCGZkBTNjdGwwMCRMZWZ0Q29sJExpY2hob2MxJHJwdHJMaWNoaG9jJGN0bDAyJGdydkxpY2hob2MPPCsADAEIAgFkBTNjdGwwMCRMZWZ0Q29sJExpY2hob2MxJHJwdHJMaWNoaG9jJGN0bDA2JGdydkxpY2hob2MPPCsADAEIZmQFM2N0bDAwJExlZnRDb2wkTGljaGhvYzEkcnB0ckxpY2hob2MkY3RsMDEkZ3J2TGljaGhvYw88KwAMAQhmZAUzY3RsMDAkTGVmdENvbCRMaWNoaG9jMSRycHRyTGljaGhvYyRjdGwwNCRncnZMaWNoaG9jDzwrAAwBCGZkBTNjdGwwMCRMZWZ0Q29sJExpY2hob2MxJHJwdHJMaWNoaG9jJGN0bDAwJGdydkxpY2hob2MPPCsADAEIAgFkhO4CQTCT9FOotSw2ZoTf5gEBbXaed4Q4OAV5jtaoJYE=',
        __VIEWSTATEGENERATOR: 'CB78C13A',
        __EVENTVALIDATION:
          '/wEdAAPwrTvSkjO6MxCyG5nv8RpLWWWHEhzFiGyQmAroNHRecPGp81KLC9U2/agHpgpfb4atL2GQMaATghjy+bylAXhJAkV++jXlveksbno26k3dtg==',
        ctl00$LeftCol$Lichhoc1$txtNgaydautuan: date,
        ctl00$LeftCol$Lichhoc1$btnXemlich: 'Xem+lịch',
      });
      const configAxios = {
        method: 'post',
        url: SCHOOL_SCHEDULE_URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookie,
          Origin: 'http://ctms.fithou.net.vn',
          Referer: SCHOOL_SCHEDULE_URL,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        },
        data: data,
      };
      const dom = await axios(configAxios);

      const $ = cheerio.load(dom.data);

      const expiredNotiText = $('#leftcontent #thongbao').text().trim();
      if (expiredNotiText === EXPIRED_CTMS) {
        return {
          isExpired: true,
        };
      }

      let list = {};
      $('#leftcontent #LeftCol_Lichhoc1_pnView div').each(function (index, element) {
        const day = $(element).children('b')?.text()?.trim()?.split('\n')[1]?.trim();
        if (day === todayformatted()) {
          let sessionOne: any[] = [];
          let sessionTwo: any[] = [];
          let sessionThree: any[] = [];

          let sessionTemp: any[] = [];

          let sessionOneCheck = false;
          let sessionTwoCheck = false;
          let sessionThreeCheck = false;

          $(element)
            .children('div')
            .children('table')
            .children('tbody')
            .children('tr')
            .eq(1)
            .children('td')
            .each(function (indexSecond, elementSecond) {
              const check = checkSession($(elementSecond).text()?.trim());

              sessionTemp.push($(elementSecond).text()?.trim());

              if (check === 'Sáng') {
                sessionOneCheck = true;
              } else if (check === 'Chiều') {
                sessionTwoCheck = true;
              } else if (check === 'Tối') {
                sessionThreeCheck = true;
              }

              if (indexSecond === 6) {
                if (sessionOneCheck) {
                  sessionOne = sessionTemp;
                  sessionTemp = [];
                  sessionOneCheck = false;
                } else if (sessionTwoCheck) {
                  sessionTwo = sessionTemp;
                  sessionTemp = [];
                  sessionTwoCheck = false;
                } else if (sessionThreeCheck) {
                  sessionThree = sessionTemp;
                  sessionTemp = [];
                  sessionThreeCheck = false;
                }
              }
            });

          $(element)
            .children('div')
            .children('table')
            .children('tbody')
            .children('tr')
            .eq(2)
            .children('td')
            .each(function (indexSecond, elementSecond) {
              const check = checkSession($(elementSecond).text()?.trim());

              sessionTemp.push($(elementSecond).text()?.trim());

              if (check === 'Sáng') {
                sessionOneCheck = true;
              } else if (check === 'Chiều') {
                sessionTwoCheck = true;
              } else if (check === 'Tối') {
                sessionThreeCheck = true;
              }

              if (indexSecond === 6) {
                if (sessionOneCheck) {
                  sessionOne = sessionTemp;
                  sessionTemp = [];
                  sessionOneCheck = false;
                } else if (sessionTwoCheck) {
                  sessionTwo = sessionTemp;
                  sessionTemp = [];
                  sessionTwoCheck = false;
                } else if (sessionThreeCheck) {
                  sessionThree = sessionTemp;
                  sessionTemp = [];
                  sessionThreeCheck = false;
                }
              }
            });

          $(element)
            .children('div')
            .children('table')
            .children('tbody')
            .children('tr')
            .eq(3)
            .children('td')
            .each(function (indexSecond, elementSecond) {
              const check = checkSession($(elementSecond).text()?.trim());

              sessionTemp.push($(elementSecond).text()?.trim());

              if (check === 'Sáng') {
                sessionOneCheck = true;
              } else if (check === 'Chiều') {
                sessionTwoCheck = true;
              } else if (check === 'Tối') {
                sessionThreeCheck = true;
              }

              if (indexSecond === 6) {
                if (sessionOneCheck) {
                  sessionOne = sessionTemp;
                  sessionTemp = [];
                  sessionOneCheck = false;
                } else if (sessionTwoCheck) {
                  sessionTwo = sessionTemp;
                  sessionTemp = [];
                  sessionTwoCheck = false;
                } else if (sessionThreeCheck) {
                  sessionThree = sessionTemp;
                  sessionTemp = [];
                  sessionThreeCheck = false;
                }
              }
            });

          list = {
            sessionOne,
            sessionTwo,
            sessionThree,
          };
        }
      });

      logoutAndRemoveCookie(login.cookie, username);

      return list;
    }

    if (login.isRemove) {
      await removeCtmsUserByEmail(
        username,
        'Tài khoản CTMS của bạn đã bị đổi mật khẩu, vui lòng đăng nhập lại để sử dụng dịch vụ nha!🥲'
      );
    }

    return login;
  } catch (error) {
    logger.error(error);
  }
};

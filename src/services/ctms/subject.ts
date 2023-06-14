/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import * as cheerio from 'cheerio';
import config from 'config';
import QueryString from 'qs';

const getUserID = async (cookie: string): Promise<string> => {
  const response = await axios.get(`${config.service.ctms}/DangkyLoptinchi.aspx?sid=`, {
    headers: {
      Cookie: cookie,
    },
  });
  return response.data.split('"getmodule:" + ')[1].split(';')[0];
};

const getSubjects = async (cookie: string, userId: string) => {
  const response = await axios.post(
    `${config.service.ctms}/DangkyLoptinchi.aspx?sid=`,
    QueryString.stringify({
      __VIEWSTATE: '/wEPDwUJNTU0NDQwMzk4ZGRMExXiqzsNsCGrc9WjobZoDcCzO2od6+mLzUrLiU+Rww==',
      __VIEWSTATEGENERATOR: '4B900DBD',
      __CALLBACKID: '__Page',
      __CALLBACKPARAM: `getmodule:${userId}`,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie,
      },
    }
  );
  const subjects = cheerio.load(response.data)('#dvLopChoDangky');
  return subjects.html();
};

const getSubjectsInHTML = (html: string): string => {
  const $ = cheerio.load(html);
  const subjects = $('tr');
  let result = '';
  for (let i = 1; i < subjects.length; i++) {
    const subject = subjects[i];
    const subjectCode = $(subject).find('td').eq(1).text().trim();
    const subjectName = $(subject)
      .find('td')
      .eq(2)
      .text()
      .trim()
      .split('\n')
      .map((x) => x.trim())
      .join('\n');
    const subjectTime = $(subject).find('td').eq(7).text().trim();
    result += `Mã lớp: ${subjectCode}
Tên lớp: ${subjectName}
Lịch học: ${subjectTime}
------------------\n`;
  }
  return result;
};

export { getSubjects, getUserID, getSubjectsInHTML };

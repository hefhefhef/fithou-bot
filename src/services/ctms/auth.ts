/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import config from 'config';
import md5 from 'md5';
import qs from 'qs';
import cheerio from 'cheerio';
import logger from 'logger';
import { pushCookies } from 'api/v1/cookies/service';

type LoginCtmsResponse = {
  cookie: string;
  isSuccess: boolean;
  isRemove: boolean;
  errorMsg: string;
};

const loginCtms = async (username: string, password: string) => {
  try {
    const data = qs.stringify({
      __EVENTTARGET: '',
      __EVENTARGUMENT: '',
      __VIEWSTATE: '/wEPDwUJNjgxODI3MDEzZGQYhImpueCRmFchkTJkEoLggX4C6Nz/NXMIzR9/49O/0g==',
      __VIEWSTATEGENERATOR: 'C2EE9ABB',
      __EVENTVALIDATION:
        '/wEdAAQxNFjzuCTBmG4Ry6gmDFTXMVDm8KVzqxEfMx7263Qx5VsdkPb56sD60m4bRwV1zT7o396vFnxqy4G+sdDoX0RYcT0vDsg4dG9gkFX2SUYDeTjkkBvsNMeyzTehazPIVNk=',
      ctl00$LeftCol$UserLogin1$txtUsername: String(username),
      ctl00$LeftCol$UserLogin1$txtPassword: String(md5(password)),
      ctl00$LeftCol$UserLogin1$btnLogin: 'Đăng+nhập',
    });

    const configOfServer = {
      method: 'post',
      url: `${config.service.ctms}/login.aspx`,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Cache-Control': 'max-age=0',
        Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: `${config.service.ctms}`,
        Referer: `${config.service.ctms}/login.aspx`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
      data: data,
    };

    const response = await axios(configOfServer);
    const dom = cheerio.load(response.data)('#LeftCol_UserLogin1_lblMess');
    console.log("response.headers['set-cookie']", response.headers['set-cookie'][0]);

    const cookie = response.headers['set-cookie'][0];

    // push cookie to db
    pushCookies(cookie, username);

    return {
      cookie,
      isSuccess: !!response.data.includes('Xin chào mừng'),
      isRemove: !!response.data.includes('Sai Tên đăng nhập hoặc Mật khẩu'),
      errorMsg: dom.text(),
    } as LoginCtmsResponse;
  } catch (err) {
    logger.error(`Error in loginCtms: ${JSON.stringify(err)}`);
    return {
      isSuccess: false,
      errorMsg: 'Lỗi kết nối',
    } as LoginCtmsResponse;
  }
};

const logoutCtms = async (cookie: string) => {
  try {
    await axios.post(
      `${config.service.ctms}/login.aspx`,
      qs.stringify({
        __VIEWSTATE: '/wEPDwUJNjgxODI3MDEzZGQYhImpueCRmFchkTJkEoLggX4C6Nz/NXMIzR9/49O/0g==',
        __VIEWSTATEGENERATOR: 'C2EE9ABB',
        __CALLBACKID: 'ctl00$QuanlyMenu1',
        __CALLBACKPARAM: 'logout',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookie,
        },
      }
    );

    logger.info('logout ctms success');
  } catch (e) {
    logger.error(`Error in logoutCtms: ${JSON.stringify(e)}`);
  }
};

export { loginCtms, logoutCtms };

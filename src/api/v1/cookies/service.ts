/* eslint-disable max-len */
import logger from 'logger';
import { UserModel } from 'models';
import CookiesModel from 'models/schemas/Cookie';
import { logoutCtms } from 'services/ctms';
import { sendMessage } from 'services/facebook';

export const pushCookies = async (cookie: string, username: string) => {
  try {
    const result = await CookiesModel.updateOne(
      {
        username,
      },
      {
        $push: {
          cookies: cookie,
        },
      },
      {
        upsert: true,
      }
    );
    logger.info(`pushCookies success username: ${username}`);
    return result;
  } catch (error) {
    logger.error(`Error in pushCookies: ${JSON.stringify(error)}`);
    throw error;
  }
};

export const removeAllCookies = async (username: string) => {
  try {
    const result = await CookiesModel.findOneAndDelete({
      username,
    });

    result?.cookies.forEach((cookie) => {
      logoutCtms(cookie);
    });

    logger.info(`removeAllCookies success username: ${username}`);
    return result;
  } catch (error) {
    logger.error(`Error in removeAllCookies: ${JSON.stringify(error)}`);
    throw error;
  }
};

export const removeAllCookiesById = async (subscribedID: string) => {
  try {
    const user = await UserModel.findOne({
      subscribedID,
    });
    const result = await CookiesModel.findOneAndDelete({
      username: user?.username,
    });

    result?.cookies.forEach((cookie) => {
      logoutCtms(cookie);
    });

    sendMessage(subscribedID, {
      text: `CTMS BOT: Đăng xuất tất cả phiên hoạt động thành công!(Nếu chẳng may hong được là do server của ai đó có vấn đề nha, hãy thử lại sau 1 lúc 😜)`,
    });
    logger.info(`removeAllCookiesById success username: ${user?.username}`);
    return result;
  } catch (error) {
    logger.error(`Error in removeAllCookiesById: ${JSON.stringify(error)}`);
    throw error;
  }
};

export const logoutAndRemoveCookie = async (cookie: string, username: string) => {
  try {
    //logout first
    logoutCtms(cookie);
    const result = await CookiesModel.findOne({
      username,
    });

    const updatedCookies = Object(result?.cookies)?.filter((c: string) => c !== cookie);
    result.cookies = updatedCookies;
    await result?.save();

    logger.info(`logoutAndRemoveCookie success username: ${username}`);
    return result;
  } catch (error) {
    logger.error(`Error in logoutAndRemoveCookie: ${JSON.stringify(error)}`);
    throw error;
  }
};

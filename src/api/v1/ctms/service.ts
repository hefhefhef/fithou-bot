import { NextFunction, Request } from 'express';

import { UserModel } from 'models';
import * as ctmsService from 'services/ctms';
import { ExamDay } from 'services/ctms/examDay';
import { sendMessage } from 'services/facebook';
import { removeCtmsUserByEmail } from '../users/service';
import { logoutAndRemoveCookie } from '../cookies/service';

export const login = async (username: string, password: string, id: string) => {
  const result = await ctmsService.loginCtms(username, password);
  if (result.isSuccess) {
    const oldUser = await UserModel.findOne({ username });
    if (!oldUser) {
      const newUser = new UserModel({ username, password, subscribedID: id });
      await newUser.save();
    } else {
      if (oldUser && oldUser.subscribedID !== id) {
        await sendMessage(oldUser.subscribedID, {
          text: `CTMS BOT: Tài khoản này đã được đăng ký với người dùng khác. Bot sẽ hủy đăng ký tài khoản này.`,
        });
        await UserModel.deleteOne({ username });
      }
      await UserModel.updateOne(
        { subscribedID: id },
        { username, password, isSubscribedSubject: false, isTrackTimetable: false }
      );
    }

    sendMessage(id, {
      text: `CTMS BOT: Đăng nhập thành công! Bạn đã có thể  sử dụng các dịch vụ ctms bot cung cấp.`,
    });

    logoutAndRemoveCookie(result.cookie, username);
  }

  if (result.isRemove) {
    await removeCtmsUserByEmail(
      username,
      'Tài khoản CTMS của bạn đã bị đổi mật khẩu, vui lòng đăng nhập lại để sử dụng dịch vụ nha!🥲'
    );
  }

  return result;
};

export const sendNotiForUserOfCTMS = async (req: Request, next: NextFunction) => {
  try {
    const { message } = req.body;
    const users: any[] = await UserModel.find();
    for (const element of users) {
      await sendMessage(element.subscribedID, {
        text: `${message}`,
      });
    }
    return message;
  } catch (error) {
    next(error);
  }
};

export const sendNotiExamDay = async (req: Request, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const result = await ExamDay(username, password);
    return result;
  } catch (error) {
    next(error);
  }
};

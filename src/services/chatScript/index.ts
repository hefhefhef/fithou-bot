import { examDay, removeCtmsAccount, sendLoginCtmsButton, sendMessage, unExamDay } from 'services/facebook';
import { helpscript } from 'utils/helpscript';
import { define } from './define';
import { removeAllCookiesById } from 'api/v1/cookies/service';

export const chatScript = async (id: string, message: string) => {
  switch (message) {
    case define.login:
      sendLoginCtmsButton(id);
      return;
    case define.logout:
      removeCtmsAccount(id);
      return;
    case define.help:
      sendMessage(id, {
        text: helpscript(),
      });
      return;
    case define.examday:
      examDay(id);
      return;
    case define.unExamday:
      unExamDay(id);
      return;
    case define.forceLogout:
      removeAllCookiesById(id);
      return;
    default:
      sendMessage(id, {
        text: `Bot ngu ngok quá, không hiểu gì hết :(`,
      });
      return;
  }
};

import RequestWithUser from 'utils/rest/request';
import * as service from './service';
import fmt from 'utils/formatter';
import { NextFunction, Response } from 'express';

export const pushCookies = async (request: RequestWithUser, response: Response, next: NextFunction) => {
  const { username, cookie } = request.body;
  const results = await service.pushCookies(cookie, username);
  response.send(fmt.formatResponse(results, Date.now() - request.startTime, 'OK', 1));
};

export const removeAllCookies = async (request: RequestWithUser, response: Response, next: NextFunction) => {
  const { username } = request.body;
  const results = await service.removeAllCookies(username);
  response.send(fmt.formatResponse(results, Date.now() - request.startTime, 'OK', 1));
};

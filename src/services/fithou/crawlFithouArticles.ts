import * as cheerio from 'cheerio';
import axios from 'axios';

import logger from 'logger';
import { ArticlesModel } from 'models';
import config from 'config';
import { CRAWL_FITHOU_TYPE, CRAWL_FITHOU_URL } from 'utils/constants';
import Articles from 'models/types/Articles';

const regex = /\d+/g;
const FITHOU_URL = config.service.fithou;

interface FetchDataFithouAndGetOldArticlesResponse {
  dom: any;
  oldArticles: Articles;
}

export interface NewsArticles {
  link: string;
  title: string;
}

export interface UpdateOldArticlesResponse {
  data: NewsArticles | NewsArticles[];
  message: string;
  code?: string;
  type: CRAWL_FITHOU_TYPE;
  subscribedIDs?: string[];
}

const fetchDataFithouAndGetOldArticles = async (url: string) => {
  try {
    const dom = axios.get(CRAWL_FITHOU_URL);
    const oldArticles = ArticlesModel.findOne();

    const resolveAll = await Promise.all([dom, oldArticles]);
    return {
      dom: resolveAll[0],
      oldArticles: resolveAll[1],
    } as FetchDataFithouAndGetOldArticlesResponse;
  } catch (error) {
    logger.error(`Error when fetching data from ${url}: ${error}`);
  }
};

const updateOldArticles = async (
  lastIdOfNewArticles: number,
  oldArticles: Articles,
  listNewsArticles: NewsArticles[]
): Promise<UpdateOldArticlesResponse> => {
  try {
    // when have new articles
    await ArticlesModel.findOneAndUpdate({
      link: `${FITHOU_URL}${listNewsArticles[0].link}`,
      title: listNewsArticles[0].title,
      aid: listNewsArticles[0].link.match(regex)[0],
    });

    // when have many new articles
    if (lastIdOfNewArticles !== oldArticles.aid + 1) {
      let index = 0;

      for (let i = 0; i < listNewsArticles.length; i++) {
        if (Number(listNewsArticles[i].link.match(regex)[0]) === oldArticles.aid) {
          index = i;
          break;
        }
      }

      const results: NewsArticles[] = [];
      for (let i = 0; i < index; i++) {
        results.push({
          link: `${config.service.fithou}${listNewsArticles[i].link}`,
          title: listNewsArticles[i].title,
        });
      }

      return {
        data: results,
        message: 'There are many new articles!',
        code: 'MANY_NEW_ARTICLES',
        type: CRAWL_FITHOU_TYPE.manyRecords,
        subscribedIDs: oldArticles.subscribedIDs,
      };
    }

    return {
      data: {
        link: `${FITHOU_URL}${listNewsArticles[0].link}`,
        title: listNewsArticles[0].title,
      },
      message: 'Have a new article!',
      code: 'ONE_NEW_ARTICLE',
      type: CRAWL_FITHOU_TYPE.oneRecord,
      subscribedIDs: oldArticles.subscribedIDs,
    };
  } catch (error) {
    logger.error(`Error when update old articles: ${error}`);
  }
};

export const crawlFithouService = async (): Promise<UpdateOldArticlesResponse> => {
  try {
    const { dom, oldArticles } = await fetchDataFithouAndGetOldArticles(CRAWL_FITHOU_URL);

    const $ = cheerio.load(dom.data);

    const listNewsArticles: NewsArticles[] = $('#LeftCol_pnlCategory div[class=article]')
      .map(function (index, element) {
        return {
          link: $(element).children('a').attr('href'),
          title: $(element).children('a').text().trim(),
        };
      })
      .get();

    if (!oldArticles) {
      const newArticles = await ArticlesModel.create({
        link: `${config.service.fithou}${listNewsArticles[0].link}`,
        title: listNewsArticles[0].title,
        aid: listNewsArticles[0].link.match(regex)[0],
      });

      return {
        data: newArticles && newArticles.toObject(),
        message: 'Have a new article!',
        code: 'ONE_NEW_ARTICLE',
        type: CRAWL_FITHOU_TYPE.new,
        subscribedIDs: oldArticles.subscribedIDs,
      };
    }

    const lastArticleAId = Number(listNewsArticles[0].link.match(regex)[0]);

    if (lastArticleAId > oldArticles.aid) {
      return await updateOldArticles(lastArticleAId, oldArticles, listNewsArticles);
    }

    return {
      data: oldArticles && {
        link: oldArticles.toObject().link,
        title: oldArticles.toObject().title,
      },
      message: 'Not change!',
      code: 'NOT_CHANGE',
      type: CRAWL_FITHOU_TYPE.noChange,
      subscribedIDs: oldArticles.subscribedIDs,
    };
  } catch (error) {
    logger.error(`Error when crawl fithou articles: ${error}`);
  }
};

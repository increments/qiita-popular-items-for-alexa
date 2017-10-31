const xml2js = require('xml2js');
const request = require('request-promise-native');
const moment = require('moment-timezone');
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const S3_REGION = process.env.DESTINATION_S3_REGION;
const S3_BUCKET = process.env.DESTINATION_S3_BUCKET;
const S3_KEY = process.env.DESTINATION_S3_KEY;

const s3 = new AWS.S3({ region: S3_REGION });

const FEED_URL = 'https://qiita.com/popular-items/feed';
const FEED_TITLE = 'Qiitaの人気の投稿';
const REDIRECTION_URL = 'https://qiita.com/popular-items';

moment.tz.setDefault('Asia/Tokyo');
moment.locale('ja', {
  weekdays: ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
  calendar: {
    lastDay: '昨日',
    sameDay: '今日',
    lastWeek: '先週dddd',
    sameElse: 'M月D日',
  },
});

function getPopularItems() {
  return request
    .get({ url: FEED_URL })
    .then(response => new Promise((resolve, reject) => {
      xml2js.parseString(response, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    }));
}

function formatFeedItem(item) {
  const title = item.title[0];
  const updated = moment(item.updated[0]).calendar();

  return `${updated}更新: 「${title}」。`;
}

function generateFeed(result) {
  const uid = `qiita-popular-items-${moment().format('YYYYMMDDHH')}`;
  const updated = moment().tz('UTC').format('YYYY-MM-DDTHH:mm:00.0\\Z');
  const entry = result.feed.entry.slice(0, 10);

  const feedJson = {
    uid,
    updateDate: updated,
    titleText: FEED_TITLE,
    mainText: entry.map(item => formatFeedItem(item)).join(' '),
    redirectionUrl: REDIRECTION_URL,
  };
  const feedJsonStr = JSON.stringify(feedJson, null, 2);
  return feedJsonStr;
}

function upload(content) {
  const params = {
    ACL: 'public-read',
    Body: content,
    Bucket: S3_BUCKET,
    Key: S3_KEY,
    CacheControl: 'max-age=600',
    ContentType: 'application/json',
  };

  return s3.putObject(params).promise()
    .then((response) => {
      console.log('putObject success');
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.error('putObject failed');
      console.error(error);
      throw new Error(error);
    });
}

exports.putFeed = (event, context, callback) => {
  Promise.resolve()
    .then(getPopularItems)
    .then(generateFeed)
    .then(upload)
    .then(() => callback(null, 'update complete'))
    .catch(error => callback(error, 'update failed'));
};

exports.generateFeed = (event, context, callback) => {
  Promise.resolve()
    .then(getPopularItems)
    .then(generateFeed)
    .then(feed => callback(null, feed))
    .catch(error => callback(error, 'execute failed'));
};

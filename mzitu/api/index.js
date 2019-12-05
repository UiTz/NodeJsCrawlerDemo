"use strict";
const r = require("superagent");
const fs = require("fs");
const baseUrl = "https://www.mzitu.com/";
const cheerio = require("cheerio");

const header = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
};

//检测文件或者文件夹存在 nodeJS
function fsExistsSync (path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * 更新请求头中的来源信息
 * @param referer
 */
function updateHeader (referer) {
  header["Referer"] = referer;
}

/**
 * 从主页获取信息
 * @param page
 * @returns {Promise<unknown>}
 */
function getInfo (page) {
  return new Promise(async (resolve, reject) => {
    let res;
    let url = baseUrl + "page/" + page;
    console.log(url);
    try {
      // console.log(url);
      updateHeader(url);
      res = await r.get(url)
                   // .set({
                   //   'Referer':url,
                   //   "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                   //   'accept-encoding': 'gzip, deflate, br',
                   //   "sec-fetch-mode":"navigate"
                   // })
                   .set(header);
      if ( res.status === 200 ) {
        resolve(res);
      }
    } catch (e) {
      console.log("请求异常");
      reject(e);
    }

  });
}

/**
 * 获取内容详细信息
 * @param id
 * @param page
 * @returns {Promise<unknown>}
 */
function getDetails (id) {
  return new Promise(async (resolve, reject) => {
    let res,
      url = baseUrl + id + "/" + page;
    let page = 1;
    let obj = {
      title: "",
      totalPage: 0,
      imgUrl: []
    };

    try {
      updateHeader(url);
      res = await r.get(url).set(header);
      if ( res.status === 200 ) {
        let $ = cheerio.load(res.text);
        if ( page === 1 ) {
          obj.title = $("body > div.main > div.content > h2").text();
          obj.totalPage = $("body > div.main > div.content > div.pagenavi > a:nth-child(7) > span").text();
        }
        let plist = [];
        for (let i = 1; i <= obj.totalPage; i ++) {
          //  TODO
        }
        resolve(obj);
      }
    } catch (e) {
      console.log("请求异常");
      reject(e);
    }

  });
}

/**
 * 保存图片
 * @param url
 * @param path
 * @returns {Promise<unknown>}
 */
function saveImg (url, path) {
  return new Promise(async (resolve, reject) => {
    let res;
    try {
      // console.log(url);
      updateHeader(url);
      res = r.get(url)
             .set(header);
      // .buffer(true);
      // .set({
      //   'Referer':originUrl,
      //   "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      //   'accept-encoding': 'gzip, deflate, br',
      //   "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
      //   "sec-fetch-mode":"navigate"
      // })

      let imgName = url.split("/").pop();
      let _path = `./imgs/${path}/`;
      !fsExistsSync(_path) && fs.mkdirSync(_path, { recursive: true });
      let stream = fs.createWriteStream(`${_path}${imgName}`);
      res.pipe(stream);
      resolve({
        msg: "下载成功"
      });
    } catch (e) {
      console.log("请求异常");
      reject(e);
    }

  });
}

module.exports = { getInfo, getDetails, saveImg };

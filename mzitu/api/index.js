"use strict";
const r = require("superagent");
require("superagent-proxy")(r);
const fs = require("fs");
const baseUrl = "https://www.mzitu.com/";
const cheerio = require("cheerio");

// const proxy = "http://110.243.0.78:9999";
const proxy = "";
const header = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
};

/**
 * 休眠等待，防止请求量过大被限制
 * @param seconds
 * @returns {Promise<unknown>}
 */
function sleep (seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

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
 * @param type
 * @returns {Promise<unknown>}
 */
function getInfo (page, type = "") {
  return new Promise(async (resolve, reject) => {
    let res;
    let url = baseUrl + (type !== "" ? type + "/" : type) + "page/" + page;
    // console.log(url);
    try {
      // console.log(url);
      updateHeader(url);
      res = await r.get(url).set(header).proxy(proxy);
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
 * 获取文章内某一页的图片 url
 * @param {*} url
 * @param {*} page
 */
function getImg (url, page) {
  return new Promise(async (resolve, reject) => {
    try {
      updateHeader(url);
      let res = await r.get(url).set(header).proxy(proxy);
      if ( res.status === 200 ) {
        let $ = cheerio.load(res.text);
        let imgUrl = $("div.main-image p a img").attr("src");
        resolve(imgUrl);
      }
    } catch (error) {
      console.log(`获取${page}页图片出错。`);
      reject(error);
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
      url = baseUrl + id;
    let obj = {
      title: "",
      totalPage: 0,
      imgUrl: []
    };

    try {
      updateHeader(url);
      res = await r.get(url).set(header).proxy(proxy);
      if ( res.status === 200 ) {
        let $ = cheerio.load(res.text);
        let imgList = [];
        imgList.push($("div.main-image p a img").attr("src"));
        obj.title = $("body > div.main > div.content > h2").text();
        obj.totalPage = $("body > div.main > div.content > div.pagenavi > a:nth-child(7) > span").text();
        console.log(`获取到当前文章图片总数为${obj.totalPage}`);
        // 保存每一页图片的地址到数组中返回
        for (let i = 50; i <= 55; i ++) {
          let img = await getImg(`${url}/${i}`, i);
          imgList.push(img);
        }
        obj.imgUrl = imgList;
        resolve(obj);
      }
    } catch (e) {
      console.log("请求异常");
      reject(e);
    }

  });
}

/**
 * 生成图片地址 来减少请求数量，防止ip被禁
 * @param {*} id
 */
function createImgList (id) {
  return new Promise(async (resolve, reject) => {
    let url = baseUrl + id;
    let obj = {
      title: "",
      totalPage: 0,
      imgUrl: []
    };

    try {
      updateHeader(url);
      let res = await r.get(url).set(header).proxy(proxy);
      if ( res.status === 200 ) {
        let $ = cheerio.load(res.text);
        let imgList = [];
        let imgUri = $("div.main-image p a img").attr("src");
        imgList.push(imgUri);
        let com = imgUri.split("/");
        com.pop();
        com = com.join("/");
        let fileName = imgUri.split("/").pop().split(".");
        let name = fileName[0].substr(0, fileName[0].length - 2);
        let suffix = fileName[1];
        // console.log(com, fileName, name, suffix)
        // resolve(obj);
        obj.title = $("body > div.main > div.content > h2").text();
        obj.totalPage = $("body > div.main > div.content > div.pagenavi > a:nth-child(7) > span").text();
        // 保存每一页图片的地址到数组中返回
        for (let i = 2; i <= obj.totalPage; i ++) {
          imgList.push(`${com}/${name}${i < 10 ? "0" + i : i}.${suffix}`);
        }
        obj.imgUrl = imgList;
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
      res = r.get(url).set(header).proxy(proxy);
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

function getIp (ip) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(ip);
      let res = await r.get("http://www.taobao.com/help/getip.php").proxy(`http://${ip}`);
      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { getInfo, getDetails, saveImg, createImgList, getIp, sleep };

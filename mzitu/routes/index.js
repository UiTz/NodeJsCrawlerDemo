"use strict";
!function () {
  const { getInfo, getDetails, saveImg, createImgList, getIp } = require("../api/index");
  const cheerio = require("cheerio");

  module.exports = app => {
    /**
     * 查询主页数据接口
     */
    app.get("/", async (req, res) => {
      let page = typeof req.query.page === "undefined" ? 1 : Number(req.query.page);
      let endPage = typeof req.query.endPage === "undefined" ? page + 1 : Number(req.query.endPage)+1;
      let type = req.query.type ? req.query.type : ""
      const dataList = [];

      let p = new Promise(async (resolve, reject) => {
        while (page < endPage) {
          // console.log(page);
          let data, $;
          try {
            data = await getInfo(page,type);
            $ = cheerio.load(data.text);
          } catch (e) {
            res.send("主页请求错误");
            console.log("主页请求错误");
          }
          const indexList = [];
          let totalPage = $("div.nav-links a").eq(- 2).text();
          $("ul#pins li").each(function () {
            // console.log(index);
            let title = $(this).find("a").eq(1).text();
            let href = $(this).children("a").attr("href");
            let id = $(this).children("a").attr("href").split("/").pop();
            let time = $(this).children(".time").text();
            let previewImg = $(this).find("a img").attr("data-original");
            let obj = {
              title, href, id, time, previewImg
            };
            indexList.push(obj);
          });
          console.log(`第${page}页数量获取完毕，开始获取url`);

          for await (let item of indexList) {
            let data = await createImgList(item.id, item.title);
            for await (let item of data.imgUrl) {
              await saveImg(item, `img/清纯妹子/${page}/${data.title}`);
            }
            console.log(`《${item.title}》————${data.totalPage}张图片下载完毕`);
          }
          page += 1;
          dataList.push({
            count: indexList.length,
            totalPage,
            page,
            indexList
          });
          console.log("所有图片保存完成");
        }
        if ( page === endPage ) {
          resolve();
        }
      });

      await p;

      res.send(dataList);
    });

    /**
     * 根据id查询文章所有图片的详情，并保存图片到本地 imgs 文件夹中
     */
    app.get("/d/:id", async (req, res) => {
      let id = req.params.id;
      // 获取id对应文章的信息 使用真实查询
      // let data = await getDetails(id);
      // 获取id对应文章的信息 使用生成链接
      let data = await createImgList(id);
      for await (let item of data.imgUrl) {
        await saveImg(item, data.title);
      }
      console.log(`《${data.title}》————${data.totalPage}张图片下载完毕`);
      res.send(data);
    });

    app.get("/ip/:ip", async (req, res) => {
      let ip = req.params.ip;
      let data = await getIp(ip);
      res.send(data);
    });
  };

}();

"use strict";
!function () {
  const { getInfo, getDetails, saveImg } = require("../api/index");
  const cheerio = require("cheerio");

  module.exports = app => {
    app.get("/", async (req, res) => {
      let page = typeof req.query.page === "undefined" ? "1" : req.query.page;
      console.log(page);
      let data;
      try {
        data = await getInfo(page);
      } catch (e) {
        res.send("主页错误");
        console.log("主页错误");
      }
      let $ = cheerio.load(data.text);
      const indexList = [];
      let totalPage = $("div.nav-links a").eq(- 2).text();
      $("ul#pins li").each(function () {
        console.log(index);
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

      res.send({
        count: indexList.length,
        totalPage,
        page,
        indexList
      });
    });

    app.get("/:id", async (req, res) => {
      let id = req.params.id;
      let page = req.params.page;
      let data = await getDetails(id);
      let $ = cheerio.load(data);
      let imgUrl = $("body > div.main > div.content > div.main-image > p > a > img").attr("src");
      let msg = await saveImg(imgUrl, "性感美人柴婉艺扭动娇躯情难自禁，脱光衣服仅剩乳贴");
      res.send(msg);
    });
  };

}();

"use strict";
!function () {
  const express = require("express");
  const app = express();
  // const cheerio = require('cheerio');
  // const superagent = require('superagent');

  app.url = "https://cnodejs.org";

  require("./routes/index")(app);

  app.listen("8081", () => {
    console.log("http://localhost:8081/");
  });
}();

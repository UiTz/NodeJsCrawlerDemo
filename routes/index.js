'use strict'

!function () {
  const cheerio = require('cheerio');
  const request = require('superagent');

  const information = []
  let page = 0
  let pageCount = 0

  function getPageData(page, url) {
    return new Promise(async (resolve, reject) => {
      const result = {
        page,
        dataList: []
      }
      const query = {
        tab: 'all',
        page
      }
      let data
      try {
        data = await request.get(url, query)
      } catch (err) {
        console.log(`第${page}页爬取失败`)
        reject(err)
      }
      if (data.status === 200) {
        // res.send(data)
        const $ = cheerio.load(data.text, { decodeEntities: false })
        console.log(`获取第${page}页数据成功，准备爬取页面数据...`)
        $('#topic_list div.cell').each((index, cell) => {
          const obj = {
            title: $(cell).find('a.topic_title').text().replace(/(^\s*)|(\s*$)/g, ""),
            href: url + $(cell).find('a.topic_title').attr('href'),
            idArticle: $(cell).find('a.topic_title').attr('href').split('/')[2],
            lastActiveTime: $(cell).find('.last_time span.last_active_time').text(),
            clicks: $(cell).find('.reply_count span.count_of_visits').text().replace(/(^\s*)|(\s*$)/g, ""),
            replies: $(cell).find('.reply_count span.count_of_replies').text().replace(/(^\s*)|(\s*$)/g, ""),
            author: $(cell).find('.user_avatar img').attr('title'),
            badge: $(cell).find('.topic_title_wrapper span').text()
          }
          // information.push(obj.data.push(obj))
          result.dataList.push(obj)
        })
        console.log(`第${page}页爬取成功`)
        resolve(result)
        // res.send(information)
      } else {
        console.log(`第${page}页返回状态码异常`)
        // res.send({
        //   status: 400,
        //   msg: '请求失败'
        // })
      }
    })
  }

  module.exports = app => {


    app.get('/', async (req, res) => {
      let html = await request.get(app.url)
      const $ = cheerio.load(html.text, { decodeEntities: false })
      let i = $('.pagination ul li a').last().attr('href').split('=')[2] || 0;
      console.log(`页数获取完毕，共${i}页数据准备爬取`)
      const plist = []
      console.log('开始创建进程')
      function rp(params) {
        for (let index = 1; index <= i; index++) {
          let p = getPageData(index, app.url)
          plist.push(p)
        }
        console.log('进程创建完毕，开始爬取数据')
        Promise.all(plist).then(data => {
          res.send(data)
        }).catch(err => {
          console.log('出现异常')
        })
      }
    })


  }
}()
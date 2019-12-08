# NodeJsCrawlerDemo
` NodeJs 爬虫 Demo `

使用`superagent`模块发送请求和`superagent-proxy`设置请求时的代理

使用`cheerio`来操作请求回来的页面

通过 NodeJs 的 fs 文件流来写入文件

### 使用方法

```git
git clone https://github.com/UiTz/NodeJsCrawlerDemo.git
```

```
cd ./NodeJsCrawlerDemo/mzitu/
```

```
yarn && yarn dev
```

```http request
/**
 * request method: get
 * 接收参数: 
 *     page: 起始请求页数(可选，默认为第一页)
 *     endPage: 结束页数(可选，默认为 起始页 + 1)
 *     type: 分类选择(可选，默认为首页)
 *         xinggan: 性感妹子
 *         japan: 日本妹子
 *         taiwan: 台湾妹子
 *         mm: 清纯妹子
 */
http://localhost/?page=1&endPage=5&type=mm
```

### 目录结构

```
  |-- LICENSE
  |-- README.md
  |-- cnodjs
  |   |-- app.js
  |   |-- package.json
  |   |-- yarn.lock
  |   |-- routes
  |       |-- index.js
  |-- mzitu
      |-- app.js
      |-- package.json
      |-- imgs
      |-- api
      |   |-- index.js
      |-- routes
          |-- index.js
```

### 实现功能

-[x] API返回获取到的数据

-[x] 代理功能

-[x] 获取到的图片连接通过流保存到本地

-[x] 指定类别的爬取

-[x] sleep 方法

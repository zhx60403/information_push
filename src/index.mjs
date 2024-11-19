import ora from 'ora'
import inquirer from 'inquirer'

import axios from 'axios'
import * as cheerio from 'cheerio'
// import puppeteer from 'puppeteer'
// import playwright from 'playwright'

import { originUrl, sendChoices } from './base.mjs'
import sendList from './push_target/index.mjs'

function fetchHTML(url) {
  try {
    return axios.get(url).then(({ data }) => data)
  } catch (error) {
    console.error(`无法获取 URL：${error}`)
  }
}

// 主要内容 .mainbox 榜单 .bangdan
// TODO: 对主要内容和榜单做区分

const mainClass = '.mainbox'
const rankClass = '.bangdan'
const sidebarId = '#sidebar'
const newPostListClass = '.new-post'
const articleItemClass = '.article-list'

// const browser = await puppeteer.launch()
// const page = await browser.newPage()
// await page.goto(url)
// const sidebar = await page.locator(sidebarId)
// const img = await page.screenshot({ path: 'screenshot.png' })
// await browser.close()

let isInited = false
let pushPlatform = []
const send = list => {
  pushPlatform.forEach(key => {
    sendList[key](list)
  })
}

let oldList = []
const getAttrList = ['href', 'title']

const filterOldList = list =>
  list.filter(({ href }) => !oldList.some(i => i.href === href))

let filterKeyword = ''
const filterListByKeyword = list =>
  list.filter(({ title }) => title && filterKeyword.some(i => title.includes(i)))

const getInformationOfPage = url =>
  fetchHTML(url).then(html => {
    const $ = cheerio.load(html)
    const newPostListSelector = `${newPostListClass}`

    // const newPostList = $(sidebarId).find(newPostListSelector).children()
    const newPostList = $(newPostListSelector).children()

    if (newPostList.length) {
      const list = []
      newPostList.each((_, element) => {
        element.children.forEach(item => {
          if (Array.isArray(item.children) && item.children.length) {
            const listItemElement = item.children[item.children.length - 1]

            if (!listItemElement) return
            const obj = {}
            getAttrList.forEach(attrKey => {
              const val = listItemElement?.attribs?.[attrKey]
              if (val) obj[attrKey] = val
            })

            list.push(obj)
          }
        })
      })
      return list
    }
    return []
  })

const main = () => {
  getInformationOfPage(originUrl).then(list => {
    let pushList = filterOldList(list)
    if (filterKeyword) pushList = filterListByKeyword(pushList)

    if (pushList.length) {
      // console.log('# pushList ', pushList)
      // console.log('# oldList ', oldList)

      oldList = [...oldList, ...pushList]
      isInited && send(pushList)
      isInited = true
    }
  })
}

const startTask = () => {
  // TODO: 随机刷新时间，防止检测
  const refreshTimeList = [5000, 8000, 10000, 20000]

  main()
  setInterval(() => {
    main()
  }, 10000)
}

const taskOption = [
  {
    type: 'checkbox',
    name: 'choices',
    message: '请选择一个推送平台',
    choices: sendChoices
  },
  {
    type: 'input',
    name: 'keyword',
    message: '请输入过滤关键字，多个关键字用 | 分开，例如：京东|淘宝|jd|tb|JD|TB',
    default: ''
  }
]

const spinner = ora('推送任务运行中...')
spinner.color = 'yellow'

inquirer.prompt(taskOption).then(({ choices, keyword }) => {
  pushPlatform = choices
  filterKeyword = keyword.split('|')
  spinner.start()
  startTask()
})

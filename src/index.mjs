import ora from 'ora'
import inquirer from 'inquirer'

import axios from 'axios'
import * as cheerio from 'cheerio'
// import puppeteer from 'puppeteer'
// import playwright from 'playwright'

import { originUrl, sendKeys } from './base.mjs'
import sendList from './push_target/index.mjs'

function fetchHTML(url) {
  try {
    return axios.get(url).then(({ data }) => data)
  } catch (error) {
    console.error(`无法获取 URL：${error}`)
  }
}

// 主要内容 .mainbox 榜单 .bangdan
// TODO: 对主要内容喝榜单做区分

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

const send = list => {
  sendList[sendKeys['飞书机器人']](list)
}

let oldList = []
const getAttrList = ['href', 'title']

const filterOldList = list =>
  list.filter(({ href }) => !oldList.some(i => i.href === href))

const main = url => {
  fetchHTML(url).then(html => {
    const $ = cheerio.load(html)

    const newPostListSelector = `${newPostListClass}`

    // const newPostList = $(sidebarId).find(newPostListSelector).children()
    const newPostList = $(newPostListSelector).children()

    if (newPostList.length) {
      const list = []
      newPostList.each((_, element) => {
        element.children.forEach(item => {
          const listItemElement = item.children[item.children.length - 1]

          if (!listItemElement) return
          const obj = {}
          getAttrList.forEach(attrKey => {
            obj[attrKey] = listItemElement.attribs[attrKey]
          })

          list.push(obj)
        })
      })

      const pushList = filterOldList(list)
      if (pushList.length) {
        oldList = [...oldList, ...pushList]
        send(pushList)
      }
    }
  })
}

const startTask = () => {
  // TODO: 随机刷新时间，防止检测
  const refreshTimeList = [5000, 8000, 10000, 20000]

  main(originUrl)
  setInterval(() => {
    main(originUrl)
  }, 10000)
}

startTask()

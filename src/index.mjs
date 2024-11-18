import ora from 'ora'
import inquirer from 'inquirer'

import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
// import playwright from 'playwright'

const url = 'http://new.xianbao.fun'

function fetchHTML(url) {
  try {
    return axios.get(url).then(({ data }) => data)
  } catch (error) {
    console.error(`无法获取 URL：${error}`)
  }
}

const sidebarId = '#sidebar'

const newPostListClass = '.new-post'

const articleItemClass = '.article-list'

// const browser = await puppeteer.launch()
// const page = await browser.newPage()

// await page.goto(url)

// // const sidebar = await page.locator(sidebarId)

// const img = await page.screenshot({ path: 'screenshot.png' })

// console.log(img)

// await browser.close()
const getAttrList = ['href', 'title']

const fieldToTextMap = {
  href: '地址',
  title: '标题'
}

// TODO: 缓存旧的列表, 每次只显示新的数据
const oldList = []

const func = url => {
  fetchHTML(url).then(html => {
    const $ = cheerio.load(html)

    const newPostListSelector = `${newPostListClass}`

    // const newPostList = $(sidebarId).find(newPostListSelector).children()
    const newPostList = $(newPostListSelector).children()

    if (newPostList.length) {
      newPostList.each((_, element) => {
        element.children.forEach(item => {
          const listItemElement = item.children[item.children.length - 1]

          if (!listItemElement) return
          const obj = {}
          getAttrList.forEach(attrKey => {
            obj[attrKey] = listItemElement.attribs[attrKey]
          })

          oldList.push(obj)
        })
      })
    }

    sendToBot(oldList)
  })
}

const botUrl = 'https://open.feishu.cn/open-apis/bot/v2/hook/585188bd-d07a-4f2d-8091-2b974d7d66c6'

const listToText = list => {
  return list.map(({ href, title }) => `标题：${title} /n 地址：<a href=${url}${href}>点我跳转</a> /n`).join('/n')
}

const sendToBot = msgList => {
  const text = listToText(msgList)
  console.log(text)

  const params = {
    msg_type: 'text',
    content: { text }
  }

  return axios.post(botUrl, params).then(res => {
    console.log(res)
  })
}

func(url)

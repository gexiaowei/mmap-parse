/**
 * index.mjs.js
 * @author gexiaowei
 * @version 1.0.0
 * copyright 2014-2019, gandxiaowei@gmail.com all rights reserved.
 */
import unzipper from 'unzipper'
import fs from 'fs-extra'
import xml2js from 'xml2js'

(async () => {
  await fs.createReadStream('source/data.mmap').pipe(unzipper.Extract({path: './.tmp'})).promise()
  let data = fs.readFileSync('./.tmp/Document.xml')
  let result = await parseString(data.toString())
  console.log(result['Map']['OneTopic'][0]['Topic'][0]['Text'][0]['$']['PlainText'])
})()

const parseString = function (data) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(data, {tagNameProcessors: [xml2js.processors.stripPrefix]}, (error, result) => {
      if (error) return reject(error)
      return resolve(result)
    })
  })
}

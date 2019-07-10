/**
 * index.mjs.js
 * @author gexiaowei
 * @version 1.0.0
 * copyright 2014-2019, gandxiaowei@gmail.com all rights reserved.
 */
import unzipper from 'unzipper'
import fs from 'fs-extra'
import _ from 'lodash'
import xml2js from 'xml2js'

(async () => {
  fs.ensureDir('./dist')
  await fs.createReadStream('source/data.mmap').pipe(unzipper.Extract({path: './.tmp'})).promise()
  let source = fs.readFileSync('./.tmp/Document.xml')
  let data = await parseString(source.toString())
  let result = []
  const root = data['Map']['OneTopic']['Topic']
  flattenTree(root, result)
  fs.writeJSONSync('./dist/source.json', result)
})()

function parseString (data) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(data, {
      mergeAttrs: true,
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    }, (error, result) => {
      if (error) return reject(error)
      return resolve(result)
    })
  })
}

function flattenTree (data, result, parent) {
  let tmp = {
    id: data.OId,
    topic: data.Text.PlainText,
    expanded: false
  }
  if (data.NotesGroup) tmp.notes = data.NotesGroup.NotesXhtmlData.PreviewPlainText
  if (data.AttachmentGroup) {
    let {AttachmentData: attachment} = data.AttachmentGroup
    attachment = Array.isArray(attachment) ? attachment : [attachment]
    tmp.attachment = attachment.map(item => {
      let id = item['Uri']['_'].replace('mmarch://bin/', '').replace('.bin', '')
      fs.copySync(`./.tmp/bin/${id}.bin`, `./dist/${id}.png`)
      return {
        id,
        name: item['FileName']
      }
    })
  }
  if (parent) tmp.parentid = parent
  else tmp.isroot = true
  result.push(tmp)
  const parent_id = data.OId
  if (data.SubTopics && data.SubTopics.Topic) {
    if (!Array.isArray(data.SubTopics.Topic)) {
      data.SubTopics.Topic = [data.SubTopics.Topic]
    }
    data.SubTopics.Topic.forEach(item => {
      flattenTree(item, result, parent_id)
    })
  }
}

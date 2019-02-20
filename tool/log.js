const fs = require('fs')
const path = require('path')
const color = require('colors-cli')
require('colors-cli/toxic')
const time = require('./time')
const tagIt = require('./tag')

const logFilePath = path.join(__dirname, '../log/allLog.log')

const log = (content, tag) => {
    // 显示配置
    const ignoreOriginalDeviceLogTag = true
    const displayTypeTag = true
    const displayCurrentTime = true
    const displayUnknowTagLog = true // 显示未知、未预先定义的日志

    if (tag) {
        if (Array.isArray(tag)) {
            tag = tag.map(tagIt).join(' ')
        } else {
            tag = tagIt
        }
    }

    const logContent = `${time.stringForNow.cyan} ${tag.yellow}  ${content}`
    console.log(logContent)

    // save to file
    const logContentForSave = `${time.stringForNow} ${tag}  ${content}`
    fs.appendFileSync(
        logFilePath, 
        `${logContentForSave}\n`, 
        {
            encoding: 'utf8',
            flag: 'a',
        }
    )
}

module.exports = log
const fs = require('fs')
const path = require('path')
const color = require('colors-cli')
require('colors-cli/toxic')
const time = require('./time')
const tagIt = require('./tag')

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
    process.stdout.write(logContent)

    // save to file
    if (!saveLogToFile || !global.saveLogFileBasicPath) {
        return
    }
    const logFilePath = path.resolve(global.saveLogFileBasicPath, `./mxlog_${time.stringForToday}.log`)
    const cleanTerminalColor = data => data.replace(/\[\d+m$/ig, '')
    const logContentForSave = `${time.stringForNow} ${cleanTerminalColor(tag)}  ${cleanTerminalColor(content)}`
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
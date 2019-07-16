const fs = require("fs")
const SerialPort = require("serialport")
const color = require("colors-cli")
require("colors-cli/toxic")
const chalk = require("chalk")
const time = require("./time")
const logContent = require("./log")
var kelvinToRgb = require('kelvin-to-rgb')

let logLineCache = ""

const onData = data => {
    let dataString = data.toString("binary")
    logLineCache += dataString
    if (!/\n$/.test(dataString)) {
        return
    }
    printLog(logLineCache)
    logLineCache = ""
}

const printLog = log => {
    // 显示配置
    const ignoreOriginalDeviceLogTag = true
    const displayTypeTag = true
    const displayCurrentTime = true
    const displayUnknowTagLog = false // 显示未知、未预先定义的日志

    // 计算缓存变量
    let unknowTag = false
    let tag = null


    if (ignoreOriginalDeviceLogTag) {
        // log = log.replace(/\[\w+\]\[[\w\:\s]+\]/ig, '')
        log = log.replace(/\[\w+\]/ig, "") // 保留固件代码行数打印
    }

    if (displayTypeTag) {
        // let tag = 'No Tag'
        switch (true) {
            case /Property\sSet\sReceived/ig.test(log): // 固件收到 APP 下发的指令
            case /\@fromCloud/ig.test(log): // 固件收到 APP 下发的指令
                tag = "From APP"
                break
            case /Message Post Reply Received/ig.test(log): // 固件上报数据给云端完成
            case /\@sendToCloud/ig.test(log): // 固件上报数据给云端完成
                tag = "To Cloud"
                break
            case /Property post all/ig.test(log): // 全部数据上报（每分钟 1 次）
                tag = "Post all"
                break
            default:
                unknowTag = true
                tag = "Unknow"
                break
        }
        // const tagMaxLength = 12 // 预定义 tag 字符串最大长度
        // const padString = '-' // 前后填充字符
        // const padStartLength = Math.floor((tagMaxLength - tag.length)/2)
        // const padEndLength = tagMaxLength - tag.length - padStartLength

        // tag = tag.padStart(padStartLength, padString)
        // tag = tag.padEnd(padEndLength, padString)
        // tag = `[ ${tag} ]`
        // log = `${tag.yellow} ${log}`
    }

    // if (displayCurrentTime) {
    //     log = `${time.stringForNow.cyan}  ${log}`
    // }

    // 不显示未知、未预定义的日志
    // if (!displayUnknowTagLog && unknowTag) {
    //     return
    // }


    let json
    let property
    if (/Property Set Received/ig.test(log)) {
        json = log.trim().replace("[solo: 170] Property Set Received, Devid: 0, Request: ", "").replace(/[\r\n]/g, "")
        property = JSON.parse((json))
    }


    // 最后再加颜色，避免给string前后加转义符
    switch (true) {
        case /Property Set Received/ig.test(log): // 固件收到 APP 下发的指令
        case /\@fromCloud/ig.test(log): // 固件收到 APP 下发的指令
            log = log.green_bt
            break
        case /Message Post Reply Received/ig.test(log): // 固件上报数据给云端完成
        case /\@sendToCloud/ig.test(log): // 固件上报数据给云端完成
            log = log.green_bt
            break
        case /Property post all/ig.test(log): // 全部数据上报（每分钟 1 次）
            log = log.yellow
            break
        default:
            log = log.black_bt
            break
    }


    // 去除行尾换行
    log = log
        .replace(/^[\n\r\s]+/ig, "")
        .replace(/[\n\r\s]+$/ig, "")

    logContent(log, ["Firmware", tag])


    //property相关参数可视化

    if (property) {
        let status = property["LightSwitch"]
        let bright = property["Brightness"]
        let hsvColor = property["HSVColor"]
        let temperature = property["ColorTemperature"]

        let switchColor = status ? "white" : "black"
        let brightString = "☀☀☀☀☀☀☀☀☀☀☀☀☀☀☀☀☀☀☀☀".slice(0, parseInt(bright * 0.2)) + "                    ".slice(0, parseInt(20 - (bright * 0.2)))
        let RGB=kelvinToRgb(temperature)
        console.log('----------------------------------')
        status >= 0 && console.log(chalk.blue.bold("开关"), chalk[switchColor]("████████████████████"), chalk.blue.bold(status))
        bright && console.log(chalk.blue.bold("亮度"), chalk.yellow(brightString), chalk.blue.bold(bright))
        temperature && console.log(chalk.blue.bold("色温"), chalk.rgb(...RGB)("████████████████████"), chalk.blue.bold(temperature))
        hsvColor && console.log(chalk.blue.bold("颜色"), chalk.hsv(hsvColor["Hue"], hsvColor["Saturation"], hsvColor["Value"])("████████████████████"), chalk.blue.bold(hsvColor["Hue"]))
        console.log('----------------------------------')

    }

}

const serialPort = {
    port: null,
    get list() {
        const fileList = fs.readdirSync("/dev", {encoding: "utf8"})
            .filter(fileName => /^cu\./ig.test(fileName))
            .filter(fileName => !/^cu\.Bluetooth/ig.test(fileName))
            .filter(fileName => !/SPPDev/ig.test(fileName))
        return fileList
    },
    baudRateList: [
        {
            value: 115200,
            name: "115200 - MXCHIP 3080 / MOC 1290",
        },
        {
            value: 921600,
            name: "921600 - MXCHIP 3060 / MOC 108",
        },
    ],
    connect: (portPath, baudRate) => {
        this.port = new SerialPort(portPath, {
            baudRate,
        })
        this.port.on("open", function () {
            console.log(`Has been open port ${portPath} by baudRate ${baudRate}`)
        })
        this.port.on("readable", () => {
            this.port.read()
        })
        // Switches the port into "flowing mode"
        this.port.on("data", onData)
    },
}

module.exports = serialPort
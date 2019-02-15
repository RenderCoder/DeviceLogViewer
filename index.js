const SerialPort = require('serialport')
const color = require('colors-cli')
require('colors-cli/toxic')

const portPath = '/dev/cu.SLAB_USBtoUART49'
const baudRate = 115200
let logLineCache = ''

const port = new SerialPort(portPath, {
  baudRate,
})

const onData = data => {
    let dataString = data.toString('binary')
    logLineCache += dataString
    if (!/\n$/.test(dataString)) {
        return
    }
    printLog(logLineCache)
    logLineCache = ''
}

const printLog = log => {
    const ignoreOriginalDeviceLogTag = true
    const displayTypeTag = true
    const displayCurrentTime = true

    switch(true) {
        case /Property\sSet\sReceived/ig.test(log): // 固件收到 APP 下发的指令
            log = log.green
            break
        case /Message Post Reply Received/ig.test(log): // 固件上报数据给云端完成
            log = log.blue
            break    
        case /Property post all/ig.test(log): // 全部数据上报（每分钟 1 次）
            log = log.blue
            break
        default:
            console.log(log)
            break
    }

    if (ignoreOriginalDeviceLogTag) {
        log = log.replace(/\[\w+\]\[[\w\:\s]+\]/ig, '')
    }

    if (displayTypeTag) {
        let tag = 'No Tag'
        switch(true) {
            case /Property\sSet\sReceived/ig.test(log): // 固件收到 APP 下发的指令
                tag = 'From APP'
                break
            case /Message Post Reply Received/ig.test(log): // 固件上报数据给云端完成
                tag = 'To Cloud'
                break    
            case /Property post all/ig.test(log): // 全部数据上报（每分钟 1 次）
                tag = 'Post all'
                break
            default:
                break
        }
        tag = tag.padEnd(8, '-')
        tag = `[${tag}]`
        log = `${tag.yellow} ${log}`
    }

    if (displayCurrentTime) {
        log = `${(new Date()).toString().cyan}  ${log}`
    }

    console.log(log)
}

port.on('open', function() {
    console.log(`Has been open port ${portPath} by baudRate ${baudRate}`)
})

port.on('readable', () => {
    port.read()
})
  
  // Switches the port into "flowing mode"
port.on('data', onData)
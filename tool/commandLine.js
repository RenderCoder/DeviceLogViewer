const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const color = require('colors-cli')
require('colors-cli/toxic')

const serialPort = require('./serialPort')
const websocketServer = require('./websocketServer')
const tagIt = require('./tag')

const cache = {
    device: null,
    baudRate: null,
}

const interaction = {
    selectDevice: {
        schema: {
            type: 'list',
            name: 'device',
            message: 'Device: ',
            prefix: '@',
            choices: () => serialPort.list,
        },
        callback: res => {
            // console.log(`selected device: ${res.device}\n`)
            cache.device = `/dev/${res.device}`
            doInteraction(interaction.selectBaudRate)
        },
    },
    selectBaudRate: {
        schema: {
            type: 'list',
            name: 'baudRate',
            message: 'Baud rate: ',
            prefix: '@',
            choices: serialPort.baudRateList,
        },
        callback: res => {
            // console.log(`selected baud rate: ${res.baudRate}\n`)
            cache.baudRate = res.baudRate
            serialPort.connect(cache.device, cache.baudRate)
            websocketServer.setup()
        },
    }
}

// 批量添加 key，用于查询
Object.keys(interaction).map(key => interaction[key].key = key)

const doInteraction = interactionItem => {
    const interactionName = interactionItem.key
    const interactionConfig = interaction[interactionName]
    if (!interactionConfig) {
        console.log('[Error] ' + `No such interaction: ${interactionName}`)
        return
    }
    inquirer.prompt([interactionConfig.schema])
        .then(interactionConfig.callback)
}


// 开始业务逻辑
const commandLine = {}

// 开始显示选择项
commandLine.start = () => {
    doInteraction(interaction.selectDevice)
}

commandLine.setup = () => {
    const args = process.argv
    const haveParams =  args.length > 1
    // console.log('args', args)
    const firstParam = haveParams ? args[2] : null
    
    if (firstParam === 'version' || firstParam === 'v') {
        const packageJSONFileContent = fs.readFileSync(
            path.resolve(__dirname, '../package.json'),
            {
                encoding: 'utf8',
            }
        )
        try {
            const packageJSON = JSON.parse(packageJSONFileContent)
            const currentVersion = packageJSON.version
            console.log('')
            console.log(`[${tag}] `.green.bold, packageJSON.name)
            console.log(`[${tagIt()}]`.green.bold, currentVersion)
            console.log('')
        } catch (error) {
            console.log('[Error] '.red.bold, error)
        }
        process.exit()
        return
    }

    // 判断是否保存日志到文件
    global.saveLogToFile = false
    if (firstParam) {
        const saveLogFileBasicPath = path.resolve(process.cwd(), firstParam)
        if (fs.existsSync(saveLogFileBasicPath)) {
            global.saveLogToFile = true
            global.saveLogFileBasicPath = saveLogFileBasicPath
        }
    }
    
    commandLine.start()
}



commandLine.setup()
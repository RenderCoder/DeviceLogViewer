const inquirer = require('inquirer')
const serialPort = require('./serialPort')
const websocketServer = require('./websocketServer')

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

commandLine.start = () => {
    doInteraction(interaction.selectDevice)
}

// run test
commandLine.start()

// inquirer
//   .prompt([
//     {
//         type: 'input',
//         name: 'name',
//         message: 'your name:',
//         default: 'nobody',
//         // validate: value => false,
//     },
//     {
//         type: 'list',
//         name: 'name',
//         message: 'Select baud rate',
//         choices: serialPort.baudRateList,
//     }
//   ])
//   .then(res => {
//     console.log(`Hi, ${res.name}`)
//   });
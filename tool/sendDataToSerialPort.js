const fs = require('fs')
const SerialPort = require('serialport')

const portPath = '/dev/cu.SLAB_USBtoUART'
const baudRate = 115200
const serialport = new SerialPort(portPath, {
    baudRate,
})

serialport.on('open', function() {
    console.log(`Has been open port ${portPath} by baudRate ${baudRate}`)
})
serialport.on('readable', () => {
    serialport.read()
})
// Switches the port into "flowing mode"
let logLineCache = ''
const onData = data => {
    let dataString = data.toString('binary')
    logLineCache += dataString
    if (!/\n$/.test(dataString)) {
        return
    }
    console.log(logLineCache)
    logLineCache = ''
}
serialport.on('data', onData)

const deviceStatus = {
    PowerSwitch: 0,
}

const updateSwitchStatus = () => {
    const targetPowerSwitchValue = deviceStatus.PowerSwitch == 0 ? 1 : 0
    deviceStatus.PowerSwitch = targetPowerSwitchValue
    const sendData = {PowerSwitch: targetPowerSwitchValue}
    const sendDataInString = JSON.stringify(sendData)
    const sendDataStringLength = sendDataInString.length
    const writeData = `AT+ILOPSENDJSON=property,${sendDataStringLength}\r${sendDataInString}\r`
    writeData.split('\r').map(x => console.log(x))
    serialport.write(writeData)
    // serialport.write('AT\r')
}

const updateProtocolAttributes = () => {
    const protocolData = {
        Temperature: Math.round(
            Math.random() * 10 + 30
        )
    }
    const sendData = {
        protocol: JSON.stringify(protocolData)
    }
    const sendDataInString = JSON.stringify(sendData)
    const sendDataStringLength = sendDataInString.length
    const writeData = `AT+ILOPSENDJSON=property,${sendDataStringLength}\r${sendDataInString}\r`
    writeData.split('\r').map(x => console.log(x))
    serialport.write(writeData)
}

const updateModel = () => {
    const sendData = {model: "demo"}
    const sendDataInString = JSON.stringify(sendData)
    const sendDataStringLength = sendDataInString.length
    const writeData = `AT+ILOPSENDJSON=property,${sendDataStringLength}\r${sendDataInString}\r`
    writeData.split('\r').map(x => console.log(x))
    serialport.write(writeData)
    // serialport.write('AT\r')
}

// updateSwitchStatus()

setInterval(() => {
    const sendPowerSwitchStatus = Math.random() > 0.5
    const forcePowerSwitch = false
    const forceProtocol = false // 高优先级
    if ((sendPowerSwitchStatus || forcePowerSwitch) && !forceProtocol ) {
        updateSwitchStatus()
    } else {
        updateProtocolAttributes()
    }
}, 1000 * 3)

// updateModel()
#! /usr/bin/env node

const path = require('path')
const fs = require('fs')

// 获取配置文件信息
// 将当前获取到的信息传递给具体的业务功能实现操作
let  configPath = path.resolve(process.cwd(), 'webpack.config.js')
let configCon = require(configPath)


let Complier = require('../')
let c = new Complier(configCon)
c.apply()
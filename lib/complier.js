const fs = require('fs')
const path = require('path')
const t = require('@babel/types')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
// 当前的逻辑是打包操作的核心‘
class Complier {
    constructor(config) {
        this.config = config // 保存全部配置信息
        this.entry = config.entry // 获取入口配置
        this.iCwd = process.cwd() // 获取工作目录
        this.modules = {} // 用于保存键名与对应的代码内容
    }
    apply() {
        console.log(path.resolve(this.iCwd, this.entry))
        // 1.根据配置入口， 构建依赖关系、
        this.buildRely(path.resolve(this.iCwd, this.entry), true)
        // 2. 输出打包内容到指定位置
        console.log(this.modules)
        // this.outputFile()
        console.log('打包执行了')
    }
    buildRely(modulePath, isEntry) { // 读取主入口中的内容， 构建依赖关系
        // 1. 读取该模块代码内容
        let source = fs.readFileSync(modulePath, 'utf-8')
    
        // 2. 依据当前模块路径获取模块id, 同时判断是否是主入口
        let moduleId = './' + path.relative(this.iCwd, modulePath)

        if (isEntry) {
            this.entryId = moduleId
        }
        // 3. 解析当前模块中的代码内容，
        let {sourceCode, dependencies} = this.parse(source, path.dirname(moduleId))
        // 4. 保存模块id 与内容对应关系
        this.modules[moduleId] = sourceCode
        // 5. 递归找到所有需要加载的模块
        dependencies.forEach(dep => {
            this.buildRely(path.resolve(this.iCwd, dep), false)
        })
    }
    parse(sourceCode, parentPath) {
        let dependencies = []
        // 字符串形式代码处理成AST
        let ast = parser.parse(sourceCode)
        // 遍历语法树，修改
        traverse(ast, {
            // 找到需要的节点类型
            CallExpression(expression) {
                let node = expression.node
                if (node.callee.name === 'require') {
                    node.callee.name = '__webpack_require__'
                    // 获取到其他需要被加载的路径
                    let moduleName = node.arguments[0].value
                    // 处理后缀, 只支持js
                    moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
                    // 最后添加动态的src
                    moduleName = './' + path.join(parentPath, moduleName)
                    // 需要保存当前模块加载到的新依赖，方便后续构建使用
                    dependencies.push(moduleName)
                    // 将上述处理之后的内容写入AST
                    node.arguments = [t.stringLiteral(moduleName)]
                }
            }
        })
        // 将修改之后的语法树重新变成可执行代码
        sourceCode = generator(ast).code
        // 将修改过程中拿到的内容进行返回
        return {
            sourceCode,
            dependencies
        }

    }
    outputFile() {}
}

module.exports = Complier
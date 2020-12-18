const path = require('path')

// 当前的逻辑是打包操作的核心‘
class Complier {
    constructor(config) {
        this.config = config // 保存全部配置信息
        this.entry = config.entry // 获取入口配置
        this.iCwd = process.cwd() // 获取工作目录
    }
    apply() {
        console.log(path.resolve(this.iCwd, this.entry))
        // 1.根据配置入口， 构建依赖关系、
        this.buildRely(path.resolve(this.iCwd, this.entry, true))
        // 2. 输出打包内容到指定位置
        // this.outputFile()
        console.log('打包执行了')
    }
    buildRely(modulePath, isEntry) { // 读取主入口中的内容， 构建依赖关系
        // 1. 读取该模块代码内容
        let source = fs.readFileSync(modulePath, 'utf-8')
    
        console.log(source)

        // 2. 依据当前模块路径获取模块id, 同时判断是否是主入口
        let moduleId = './' + path.relative(this.iCwd, modulePath)

        if (isEntry) {
            this.entryId = moduleId
        }
        // 3. 解析当前模块中的代码内容，
        this.parse(source, path.dirname(moduleId))
        // 4. 保存模块id 与内容对应关系
        // 5. 递归找到所有需要加载的模块
    }
    parse(sourjcejCode, parentPath) {
        
    }
    outputFile() {}
}

module.exports = Complier
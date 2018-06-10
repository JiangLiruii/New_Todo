# New_Todo

## Restart Todo Project with React framework

### 使用方法
- npm i 安装依赖
- npm run start 启动项目,会自动打开浏览器
- 如果未打开浏览器,请点击 http://localhost:8080 可访问

### 项目说明

- 这是我的todo项目的react版本
- 仅使用了react和react-dom库
- 组件间通信采用了两种方式
  - 1 使用context
  - 2 父组件传props到子组件
- 布局继续沿用了flex方式。

### 目录结构
```
.
├── bundle.js ---> 自动打包生成的js文件，可在webpack中进行配置
├── components ---> 包含所有组件
│   ├── add_items.tsx --> 添加待办项
│   ├── app.tsx --> 主组件
│   ├── item_filter.tsx --> 待办项筛选组件
│   ├── item_list.tsx --> 待办项列表组件
│   ├── item.tsx --> 单个待办项组件
│   └── pagination.tsx --> 分页组件
├── index.html --> 主入口
├── node_modules
├── package.json
├── README.md
├── res --> 资源文件夹
│   └── img
├── style.css --> 样式表
├── tsconfig.json
└── webpack.config.js --> webpack配置表
```

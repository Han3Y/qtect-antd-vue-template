const path = require('path')
const webpack = require('webpack')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GitRevision = new GitRevisionPlugin()
const buildDate = JSON.stringify(new Date().toLocaleString())
const createThemeColorReplacerPlugin = require('./config/plugin.config')
const apiMocker = require('mocker-api');

function resolve(dir) {
  return path.join(__dirname, dir)
}

// check Git
function getGitHash() {
  try {
    return GitRevision.version()
  } catch (e) {
  }
  return 'unknown'
}

const isProd = process.env.NODE_ENV === 'production'

const assetsCDN = {
  // webpack build externals
  // externals: {
  //   vue: 'Vue',
  //   'vue-router': 'VueRouter',
  //   vuex: 'Vuex',
  //   axios: 'axios'
  // },
  // css: [],
  // // https://unpkg.com/browse/vue@2.6.10/
  // js: [
  //   '//cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js',
  //   '//cdn.jsdelivr.net/npm/vue-router@3.5.1/dist/vue-router.min.js',
  //   '//cdn.jsdelivr.net/npm/vuex@3.1.1/dist/vuex.min.js',
  //   '//cdn.jsdelivr.net/npm/axios@0.21.1/dist/axios.min.js'
  // ]
}

// vue.config.js
const vueConfig = {
  configureWebpack: {
    // webpack plugins
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.DefinePlugin({
        APP_VERSION: `"${require('./package.json').version}"`,
        GIT_HASH: JSON.stringify(getGitHash()),
        BUILD_DATE: buildDate
      })
    ],
    // if prod, add externals
    externals: isProd ? assetsCDN.externals : {}
  },

  chainWebpack: config => {
    config.resolve.alias.set('@$', resolve('src'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })

    // if prod is on
    // assets require on cdn
    if (isProd) {
      config.plugin('html').tap(args => {
        args[0].cdn = assetsCDN
        return args
      })
    }
  },

  css: {
    loaderOptions: {
      less: {
        postcss: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer')
          ]
        },

        /*
        // If you are using less-loader@5 please spread the lessOptions to options directly

        https://github.com/vueComponent/ant-design-vue/blob/master/components/style/themes/default.less
         // Menu
        @menu-inline-toplevel-item-height: 40px;
        @menu-item-height: 40px;
        @menu-collapsed-width: 80px;
        @menu-bg: @component-background;
        @menu-popup-bg: @component-background;
        @menu-item-color: @text-color;
        @menu-highlight-color: @primary-color;
        @menu-item-active-bg: @item-active-bg;
        @menu-item-active-border-width: 3px;
        @menu-item-group-title-color: @text-color-secondary;
        @menu-icon-size: @font-size-base;
        @menu-icon-size-lg: @font-size-lg;
         */
        modifyVars: {
          // less vars，customize ant design theme
          'primary-color': '#006ebc',
          'primary-color-disabled': '#006ebc', // 按钮禁用颜色
          'link-color': '#006ebc',
          'layout-header-background': '#1e2c3d', // 左侧菜单背景色
          'header-background': '#1e2c3d', // 页面头部背景色、弹窗头部
          'header-color': '#fff', // 页面头部字体色
          'sider-menu-hover-background': '#006ebc', // 菜单选中背景色
          'sider-menu-expend-background': '#000c17', // 菜单展开部分背景色
          'border-radius-base': '2px',
          'layout-header-height': '56px',
          'layout-sider-width': '240px',
          'menu-inline-toplevel-item-height': '48px',
          'menu-item-height': '48px'
        },
        // DO NOT REMOVE THIS LINE
        javascriptEnabled: true

      }
    }
  },

  devServer: {
    host: '0.0.0.0',
    port: 8005, // 端口号
    https: false, // https:{type:Boolean}
    open: false, // 配置自动启动浏览器  open: 'Google Chrome'-默认启动谷歌

    before: (app) => {
      if (!app) {
        throw new Error('webpack-dev-server is not defined')
      }
      apiMocker(app, path.resolve('./src/mocker/index.js'))
    },
// /api/v1
    // 配置多个代理
    proxy: {
      '/api/v1': {
        target: 'http://192.168.1.231:80',
        ws: true, // 代理的WebSockets
        changeOrigin: true // 允许websockets跨域
        /*     pathRewrite: {
              '^/v1': ''
            } */
      },
      '/wsstone': {
        // target: 'http://192.168.5.247:8085',
        target: 'http://127.0.0.1:8087',
        ws: true, // 代理的WebSockets
        changeOrigin: true // 允许websockets跨域
      }
    }
  },

  // disable source map in production
  productionSourceMap: false,
  lintOnSave: false,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}

// preview.pro.loacg.com only do not use in your production;
if (process.env.VUE_APP_PREVIEW === 'true') {
  // add `ThemeColorReplacer` plugin to webpack plugins
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
}

module.exports = vueConfig



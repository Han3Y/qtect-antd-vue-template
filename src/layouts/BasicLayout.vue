<template>
  <div>
    <pro-layout
      :menus='menus'
      :collapsed='collapsed'
      :mediaQuery='query'
      :isMobile='isMobile'
      :handleMediaQuery='handleMediaQuery'
      :handleCollapse='handleCollapse'
      :i18nRender='i18nRender'
      v-bind='settings'
    >
      <!-- 1.0.0+ 版本 pro-layout 提供 API，
            我们推荐使用这种方式进行 LOGO 和 title 自定义
      -->


      <template v-slot:menuHeaderRender>
        <HeadLogo/>
      </template>
      <!-- 1.0.0+ 版本 pro-layout 提供 API,
            增加 Header 左侧内容区自定义
      -->
      <template v-slot:headerContentRender>
        <!--   系统时间   -->
        <SystemTime/>
        <!--      <div>-->
        <!--        <a-tooltip title="刷新页面">-->
        <!--          <a-icon type="reload" style="font-size: 18px;cursor: pointer;" @click="() => { $message.info('只是一个DEMO') }" />-->
        <!--        </a-tooltip>-->
        <!--      </div>-->
      </template>
      <!--
          <setting-drawer v-if="isDev" :settings="settings" @change="handleSettingChange">
            <div style="margin: 12px 0;">
              This is SettingDrawer custom footer content.
            </div>
          </setting-drawer>
          -->
      <template>
        <!--       <tittle-tabs/>-->
        <!-- <div class="pagetitle"  style="background-color: #fff;">
          Tab标签
        </div> -->
      </template>

      <template v-slot:rightContentRender>
        <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile='isMobile' :theme='settings.theme' />
      </template>

      <!--     <template #menuRender>-->
      <!--      <p>的的大苏打s大萨达</p>-->
      <!--      <p>的的大苏打s大萨达</p>-->
      <!--      <p>的的大苏打s大萨达</p>-->
      <!--    </template>-->


      <!-- custom footer / 自定义Footer -->
      <template v-slot:footerRender>

        <!--      <global-footer />-->
      </template>
      <title-tabs/>
      <router-view />
    </pro-layout>
    <div @click="collapsed = !collapsed" class="tw-fixed tw-left-7 tw-bottom-8 tw-z-10 tw-text-white tw-text-xl tw-cursor-pointer">
      <a-icon type="menu-fold" v-if="!collapsed" />
      <a-icon type="menu-unfold" v-if="collapsed" />
    </div>
  </div>
</template>

<script>
// import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapState, mapMutations } from 'vuex'
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE, SET_APP_DATA } from '@/store/mutation-types'

import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import LogoSvg from '../assets/logo.svg?inline'
import TitleTabs from './TitleTabs'
import { commonServiceApi } from '@/api/common'
import StorageUtil from '@/utils/storage'
import HeadLogo from "@/components/HeadLogo/HeadLogo";
import SystemTime from "@/components/SystemTime/SystemTime";

export default {
  name: 'BasicLayout',
  components: {
    // SettingDrawer,
    RightContent,
    GlobalFooter,
    LogoSvg,
    HeadLogo,
    SystemTime,
    TitleTabs
  },
  data() {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end
      isDev: process.env.NODE_ENV === 'development' || process.env.VUE_APP_PREVIEW === 'true',

      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: defaultSettings.title,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // CONTENT_WIDTH_TYPE
        contentWidth: defaultSettings.layout === 'sidemenu' ? CONTENT_WIDTH_TYPE.Fluid : defaultSettings.contentWidth,
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,
        siderWidth: defaultSettings.Width,//配置sider宽度
        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false,
      layer: null
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.permission.addRouters,
      app: state => state.app
    })
  },
  created() {
    const routes = this.mainMenu.find(item => item.path === '/')
    console.log(this.mainMenu, '路由-----')

    this.menus = (routes && routes.children) || []
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
  },
  mounted() {

    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    /*     if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
          updateTheme(this.settings.primaryColor)
        } */
  },
  methods: {
    i18nRender,
    handleMediaQuery(val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse(val) {
      this.collapsed = val
    },
    handleSettingChange({ type, value }) {
      console.log('type', type, value)
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fixed
          }
          break
      }
    },

  }
}
</script>

<style lang='less'>
@import "./BasicLayout.less";
</style>

<template>
  <a-config-provider :locale="locale">
    <div id="app" >
      <router-view/>
    </div>
  </a-config-provider>
</template>
<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'
import zhCN from'ant-design-vue/lib/locale-provider/zh_CN'

export default {
  components:{
  },
  data () {
    return {
      locale:zhCN,
    }
  },
  computed: {
  //   locale () {
  //     // 只是为了切换语言时，更新标题
  //     const { title } = this.$route.meta
  //     title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))

  //     return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
  //   }
   }
}
</script>

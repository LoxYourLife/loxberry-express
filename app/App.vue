<script setup>
</script>

<template>
  <router-view />
</template>

<style lang="sass">
@import '@quasar/extras/material-icons/material-icons.css'
@import 'quasar/src/css/index.sass'

#app .ui-btn
  margin-bottom: 0
  width: auto

h1.ui-title
  font-weight: 700
  line-height: 21px
  letter-spacing: normal
#page_content, #app .ui-checkbox
  margin: 0 !important
</style>
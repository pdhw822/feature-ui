<template>
    <div>
      <FeatureManager v-if="!selectedFeature" />
      <FeatureActions v-if="selectedFeature" :feature="selectedFeature" />
    </div>
  </template>
  
  <script>
  import FeatureManager from './components/FeatureManager.vue'
  import FeatureActions from './components/FeatureActions.vue'

  const eventBus = window._rundeck && window._rundeck.eventBus ? window._rundeck.eventBus : null

  export default {
    name: 'App',
    components: { FeatureManager, FeatureActions },
    data() {
        return {
            selectedFeature: null
        }
    },
    methods: {
      selectFeature(feature) {
        this.selectedFeature = feature
      },
      updateUiToken(tkdata) {
        document.getElementById('ui_token').innerText = JSON.stringify(tkdata)
      }
    },
    mounted() {
      if(eventBus) {
        eventBus.$on('select-feature', this.selectFeature)
        eventBus.$on('update-ui-token', this.updateUiToken)
      }
    },
    beforeDestroy() {
      eventBus.$off('select-feature', this.selectFeature)
      eventBus.$off('update-ui-token', this.updateUiToken)
    }
  }
  </script>
  
  <style>
  .clickable {
  cursor: pointer;
  text-decoration: underline;
}
  </style>
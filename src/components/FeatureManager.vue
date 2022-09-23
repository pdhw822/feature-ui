<template>
    <div>
      <div class="row">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-content">
              <div class="text-h3">Features</div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-content">
              <div class="row">
                <div class="col-sm-2 text-h5">Feature</div>
                <div class="col-sm-8 text-h5">Description</div>
                <div class="col-sm-2 text-h5 col-last">Enabled</div>
              </div>
              <div class="row row-border-top row-hover" v-for="feature in features" :key="feature.name">
                <div class="col-sm-2"><span class="clickable" @click="selectFeature(feature)">{{feature.name}}</span></div>
                <div class="col-sm-8">{{feature.description}}</div>
                <div class="col-sm-2 col-last"><input type="checkbox" v-model="feature.enabled" @change="toggleFeatureEnabled(feature)" /></div>
              </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>

  const eventBus = window._rundeck && window._rundeck.eventBus ? window._rundeck.eventBus : null
  
  var rdBase = "http://localhost:4440"
  var apiVersion = "40"
  if (window._rundeck && window._rundeck.rdBase && window._rundeck.apiVersion) {
    rdBase = window._rundeck.rdBase;
    apiVersion = window._rundeck.apiVersion
  }

  export default {
    name: 'FeatureManager',
    components: {  },
    data() {
        return {
            features: []
        }
    },
    methods: {
      selectFeature(feature) {
          eventBus.$emit('select-feature', feature)
      },
      async loadFeatures() {
        let rsp  = await fetch(`${rdBase}api/${apiVersion}/features/list`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            "x-rundeck-ajax": true
          }
        })
        let data = await rsp.json()
        this.features = data.features
      },
      async toggleFeatureEnabled(feature) {
        let token = JSON.parse(document.getElementById("ui_token").innerText)
        let payload = {enabled: feature.enabled}
        let rsp  = await fetch(`${rdBase}api/${apiVersion}/feature/${feature.name}/toggleEnabled`, {
            method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            "x-rundeck-ajax": true,
            'X-Rundeck-Token-Key': token.TOKEN,
            'X-Rundeck-Token-Uri': token.URI
          },
          body: JSON.stringify(payload)
        })
        eventBus.$emit('update-ui-token', {TOKEN: rsp.headers.get('X-Rundeck-Token-Key'),URI: rsp.headers.get('X-Rundeck-Token-Uri')})
      },
      initToken() {
        this.token = JSON.parse(document.getElementById("ui_token").innerText)
      }
    },
    mounted() {
      this.loadFeatures()
      this.initToken()
    }
  }
  </script>
  
  <style>
  .frow:hover {
    background-color: #eee;
  }
  </style>
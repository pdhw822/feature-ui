<template>
    <div>
      <div class="row">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-content">
              <div class="text-h3">Feature: {{feature.name}}</div>
              <div><span class="clickable" @click="navFeatureManager()">&lt; Feature Manager</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-content">
              <div class="row">
                <div class="col-sm-2 text-h5">Action</div>
                <div class="col-sm-10 text-h5">Description</div>
              </div>
              <div class="row row-border-top row-hover clickable" v-for="action in featureActions" :key="action.name"  @click="prepare(action)">
                <div class="col-sm-2">{{action.name}}</div>
                <div class="col-sm-10">{{action.description}}</div>
              </div>
          </div>
          </div>
        </div>
      </div>
      <div v-if="selectedAction">
      <div class="row">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-content">
                <div class="text-h3">Action: {{selectedAction.name}}</div>
                <div>{{selectedAction.description}}</div>
                <hr/>
                <div class="text-h5">Payload</div>
                <div v-for="(val, lbl) in form" :key="lbl">
                    <label>{{lbl}}</label><input type="text" class="txtlong" :id="lbl" v-model="form[lbl]"/>
                </div>
                <div v-if="feature.enabled"><button @click="execAction">Execute</button>
                    <img :src="spinnerImg" width="20" height="20" v-if="executing" />
                </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-content">
                <div class="text-h3">Output</div>
                <hr />
                <div id="startEvent" class="output" v-if="startEvent">
                    <span class="event-label">Start Event: </span>
                    <label>Timestamp: <span>{{startEvent.timestamp}}</span></label>
                    <label>User: <span>{{startEvent.initiator}}</span></label>
                </div>
                <div id="completeEvent" class="output" v-if="completeEvent">
                    <span class="event-label">Complete Event: </span>
                    <label>Timestamp: <span>{{completeEvent.timestamp}}</span></label>
                    <label>Status: <span>{{completeEvent.status}}</span></label>
                </div>
                <div id="outputEvents" class="output">
                    <div class="row">
                        <div class="col-sm-1 text-h5">Timestamp</div>
                        <div class="col-sm-1 text-h5">Level</div>
                        <div class="col-sm-10 text-h5">Message</div>
                    </div>
                    <div v-for="evt in outputEvents" :key="evt.timestamp" class="row">
                        <div class="col-sm-1">{{evt.timestamp}}</div>
                        <div class="col-sm-1">{{evt.level}}</div>
                        <div class="col-sm-10"><pre>{{evt.message}}</pre></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
</template>

<script>
var rdBase = "http://localhost:4440"
var apiVersion = "40"
if (window._rundeck && window._rundeck.rdBase && window._rundeck.apiVersion) {
rdBase = window._rundeck.rdBase;
apiVersion = window._rundeck.apiVersion
}
var cdnBase = rdBase+"user-assets/rundeck-ui"

const eventBus = window._rundeck && window._rundeck.eventBus ? window._rundeck.eventBus : null

export default {
    name: 'FeatureActions',
    components: {  },
    props: {
        feature: Object
    },
    data() {
        return {
            featureActions: [],
            selectedAction: null,
            actionId: null,
            executing: false,
            startEvent: null,
            completeEvent: null,
            outputEvents: [],
            form: {}
        }
    },
    computed: {
        spinnerImg() {
            return `${cdnBase}/images/spinner-blue.gif`
        }
    },
    methods: {
        getUiToken() {
            return JSON.parse(document.getElementById("ui_token").innerText)
        },
        prepare(action) {
            this.selectedAction = action
            this.form = { ...(action.sampleData) }
        },
        navFeatureManager() {
            eventBus.$emit('select-feature', null)
        },
      async loadFeatureActions() {
        let rsp  = await fetch(`${rdBase}api/${apiVersion}/feature/${this.feature.name}/actions`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            "x-rundeck-ajax": true
          }
        })
        let data = await rsp.json()
        this.featureActions = data.actions
      },
      async getActionOutput() {
        let rsp  = await fetch(`${rdBase}api/${apiVersion}/output/${this.actionId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            "x-rundeck-ajax": true
          }
        })
        let data = await rsp.json()
        this.startEvent = data.startEvent
        this.outputEvents = data.events
        this.completeEvent = data.completeEvent
        if(!this.completeEvent) {
            window.setTimeout(this.getActionOutput, 2000)
        } else {
            this.executing = false
        }
      },
      async execAction() {
        let token = this.getUiToken()
        this.executing = true
        this.startEvent = null
        this.completeEvent = null
        this.outputEvents = []
        let payload = {...(this.form)}
        let rsp  = await fetch(`${rdBase}api/${apiVersion}/act/${this.feature.name}/${this.selectedAction.name}`, {
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
        let data = await rsp.json()
        eventBus.$emit('update-ui-token', {TOKEN: rsp.headers.get('X-Rundeck-Token-Key'),URI: rsp.headers.get('X-Rundeck-Token-Uri')})
        this.actionId = data.actionId
        if(rsp.ok) window.setTimeout(this.getActionOutput, 2000)
        else {
            window.alert("failed to execution action")
            this.executing = false
        }
      }
    },
    mounted() {
      this.loadFeatureActions()
    }
}
</script>

<style scoped>
.output label {
    margin: 2px;
    padding: 0 2px;
    background-color: #ddd;
    border: 1px solid #aaa;
    border-radius: 2px;
}
.event-label {
    font-size: 1.75rem;
}
.txtlong {
    width: 600px;
}
</style>
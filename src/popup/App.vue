<template>
  <div>
    <button @click="load_(checked)">Load</button>
    <button @click="export_x">Excel</button>
    <button @click="export_j">JSON</button>
    <input type="checkbox" id="isRandom" v-model="checked">
    <label for="isRandom">Randomize</label>
  </div>
</template>

<script>
import { loadTranscript, exportTranscript, exportTranscriptJSON} from "../contentScripts/index.js";

export default {
  data: function() {
    return {
      checked: false
    }
  },
  methods: {
    load_: loadTranscript,
    export_x: exportTranscript,
    export_j: exportTranscriptJSON
  },
};
</script>

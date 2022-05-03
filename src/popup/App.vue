<template>
  <div>
    <button @click="load_">Load</button>
    <button @click="export_">Export</button>
  </div>
</template>

<script>
import { loadTranscript, exportTranscript } from "../contentScripts/index.js";

export default {
  methods: {
    load_: loadTranscript,
    export_: exportTranscript,
  },
};
</script>

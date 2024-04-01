<template>
  <template v-if="d.details?.method_details">


    <v-divider></v-divider>

    <v-list-item>
      <codemirror v-model="signature" :autofocus="false" :indent-with-tab="false" :tab-size="1" :disabled="true"
        :extensions="[juliaParser()]" />

      Signature: {{ d.details.method_details.signature }}
    </v-list-item>

    <v-divider></v-divider>

    <v-list-subheader>Method Body:</v-list-subheader>

    <codemirror v-model="body" placeholder="Code goes here..." :autofocus="false" :indent-with-tab="false" :tab-size="2"
      :disabled="true" :extensions="[juliaParser()]" />

    <!-- <v-divider></v-divider>

    <v-list-subheader>Other implementations:</v-list-subheader>
    TODO
  -->

  </template>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { Details, NodeDatum } from '../Graph/build';
import { julia as juliaParser } from "@plutojl/lang-julia"
import { Codemirror } from 'vue-codemirror'

const props = defineProps<{
  d: NodeDatum
}>()

const body = computed(() => {
  let start = (props.d.details.line || 0);
  if (start < 0) start = 0;
  const lines = props.d.parent?.details.file_details?.text.split('\n') || []
  let end = lines.length

  for (const c of props.d.parent?.children || []) {
    if (c.details.line > start && c.details.line < end) {
      end = c.details.line
    }
  }
  start = Math.max(0, start - 1)
  return lines.slice(start, Math.max(start, end - 1)).join('\n')
})

const signature = computed(() => {
  let start = (props.d.details.line || 0);
  if (start < 0) start = 0;
  const lines = props.d.parent?.details.file_details?.text.split('\n') || []
  start = Math.max(0, start - 1)
  return lines[start]
})

</script>
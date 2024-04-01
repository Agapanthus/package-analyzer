<template>
  <template v-if="d?.details?.folder_details">
    <template v-if="has_pie">
      <v-divider></v-divider>
      <v-list-subheader>Code Distribution:</v-list-subheader>
      <v-list-item>Bright portions correspond to lines of comments. Dark portions correspond to lines of code and
        are labelled with the language and numerical value of lines of code.
      </v-list-item>
      <div id="my-pie"></div>
      <v-list-item v-if="loc">
        <table>
          <template v-for="([k, v]) in Object.entries(loc)" :key="k">
            <tr v-if="k.endsWith('@files')" :key="k">
              <td>{{ k.split('@')[0] }} files: </td>
              <td> {{ v }}</td>
            </tr>
          </template>
        </table>
      </v-list-item>


    </template>

  </template>
</template>
<script setup lang="ts">
import { computed, defineProps, nextTick, onMounted, ref, watch } from 'vue';
import { NodeDatum, nodeDatum_loc } from '../Graph/build';
import { createPie } from './pie';
const props = defineProps<{
  d: NodeDatum | null
}>()

const loc = computed(() => props.d && nodeDatum_loc(props.d))
const has_pie = ref(false)

onMounted(() => {
  watch(loc, (newLoc) => {
    has_pie.value = false
    const nl: Record<string, number> = {}
    for (const [k, v] of Object.entries(newLoc || {})) {
      if (k.endsWith('@code') || k.endsWith('@comment'))
        nl[k] = v
    }
    let el = document.getElementById("my-pie");
    if (el) el.innerHTML = "";
    if (Object.keys(nl).length == 0) return;
    if (Object.values(nl).reduce((a, b) => a + b, 0) <= 0) return;
    has_pie.value = true
    nextTick(() => createPie("#my-pie", nl))
  }, { immediate: true })
})

</script>
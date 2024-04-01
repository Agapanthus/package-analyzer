<template>
  <div ref="element" id="graph" v-if="!no_data" />
  <v-card title="Preparing the graph..." max-width="400">
    <v-card-item>
      <v-progress-linear v-if="!no_data" v-model="progress" color="blue-grey" height="25"
        :indeterminate="progress <= 1">
        <template v-slot:default="{ value }">
          <strong>{{ Math.ceil(value) }}%</strong>
        </template>
      </v-progress-linear>
      <div v-else>
        No analysis results found. Please analyze a Julia package first.
      </div>
    </v-card-item>
  </v-card>

  <div style="position:fixed; right: 1em; top: 1em; z-index: 1000">
    <v-btn :icon="fab.icon" :color="fab.color" @click="fabClick" size="x-large"></v-btn>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import { Graph, NodeDatum } from "./build"
import { D3Graph } from "./d3"
import Axios from "axios"
import { useGraphStore } from '../../plugins/store';

const props = defineProps<{
  modelValue: NodeDatum | null
}>()
const emits = defineEmits(["update:modelValue"])

const progress = ref(0);


const element: Ref<HTMLElement | null> = ref(null);
const no_data = ref(false)
const store = useGraphStore()

//import data_raw from "../../../../../res.json"
let dataPromise = new Promise<any>((res, rej) => {
  no_data.value = false
  //res(data_raw);
  Axios.get("data.json").then((response) => {
    res(response.data)
  }, () => {
    res(null)
  });
});

let d3graph: D3Graph | null = null;
const selected: Ref<NodeDatum | null> = ref(null);
watch(props, () => {
  selected.value = props.modelValue
  show_element(selected.value)
}, { immediate: true });

function show_element(d: NodeDatum | null) {
  selected.value = d
  emits("update:modelValue", d)
  if (d3graph) {
    d3graph.reset_highlight();
    d3graph.reset_highlight_link();
    if (d) {
      d3graph.highlight_node(d.id, "red");
      d3graph.highlight_link(`${d.parent?.id} ${d.id}`, "red");
      for (const n of d.children) {
        d3graph.highlight_link(`${d.id} ${n.id}`, "green");
      }
    }
  }
}

const fab = ref({ key: 0, icon: "mdi-pause", color: "primary" });

function simuContinue() {
  fab.value.icon = "mdi-pause";
  d3graph && d3graph.restart();
}
function simuStop() {
  fab.value.icon = "mdi-play";
  d3graph && d3graph.stop();
}
function fabClick() {
  if (fab.value.icon == "mdi-play") {
    return simuContinue();
  } else {
    return simuStop();
  }
}


onMounted(() => {
  const width = element.value?.clientWidth || document.body.clientWidth;
  const height = element.value?.clientHeight || document.body.clientHeight;

  dataPromise.then(data => {

    store.$state.graph = null
    if (!data) {
      no_data.value = true
      return;
    }
    const graph = new Graph(data)
    d3graph = new D3Graph(width, height, show_element, graph, (d3graph: D3Graph) => {
      // Stop simulation once sufficiently settled
      if (d3graph.alpha() < 0.01) {
        simuStop();
      } else {
        fab.value.icon = "mdi-pause";
      }
    });

    d3graph && d3graph.warmstart_worker((prog: number, total: number) => {
      progress.value = prog / total * 100;
    }, () => {
      store.$state.graph = graph
    });
  })
});

onBeforeUnmount(() => {
  d3graph && d3graph.unmount();
});
</script>
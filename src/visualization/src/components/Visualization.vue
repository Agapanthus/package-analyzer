<template>
  <my-graph v-if="store.renderGraph" v-model="selected" />
  <drawer v-model="selected" />
</template>

<script setup lang="ts">
import MyGraph from './Graph/Graph.vue'
import Drawer from './Drawer/Drawer.vue'
import { Ref, ref } from 'vue'
import { Graph, NodeDatum } from './Graph/build';
import { useGraphStore } from '../plugins/store';

const store = useGraphStore()

const selected: Ref<null | NodeDatum> = ref(null as any);

</script>

<style>
html {
  overflow-y: hidden;
}
</style>

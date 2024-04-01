import { defineStore } from 'pinia'
import { Graph } from "../components/Graph/build"
import { Ref, ref } from 'vue'

export const useGraphStore = defineStore('graph', () => {
    const graph: Ref<Graph | null> = ref(null)
    const name: Ref<string> = ref('DataFrames')
    const renderGraph: Ref<boolean> = ref(false)

    return { graph, name, renderGraph }
})
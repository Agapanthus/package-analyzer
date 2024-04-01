<template>
  <v-list>
    <v-list-item :title="'Julia Artifact Analysis: ' + store.$state.name"
      subtitle="A tool to analyze and visualize the structure of a Julia-package.">
      <template v-slot:prepend>
        <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
      </template>
    </v-list-item>
    <v-divider></v-divider>
    <v-list-subheader>Package to analyze:</v-list-subheader>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-package" color="black"></v-icon>
      </template>
      <v-card ref="form">
        <v-card-text>
          Enter the name of the Julia package to analyze. It must be registered in the official <a
            href="https://github.com/JuliaRegistries/General">Julia package registry</a>.
        </v-card-text>
        <v-card-text>
          <v-progress-circular color="primary" v-if="loading" indeterminate></v-progress-circular>
          <template v-else> <v-text-field v-model="store.$state.name" label="Package Name" outlined
              @submit="submit"></v-text-field>
            <v-btn color="primary" @click="submit">
              Analyze!
            </v-btn></template>
        </v-card-text>
      </v-card>
    </v-list-item>

    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-console-line" color="black"></v-icon>
      </template>
      <v-card color="black">
        <v-textarea id="console-textarea" v-model="output" readonly color="white" :lines="5"></v-textarea>
      </v-card>
    </v-list-item>

    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-folder" color="orange"></v-icon>
      </template>
      <v-btn :color="thinking ? 'grey' : 'primary'" :disabled="thinking" @click="go_to_module">
        Go to main!
      </v-btn>
    </v-list-item>

    <v-divider></v-divider>
    <v-list-subheader>Basic Navigation:</v-list-subheader>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-graph-outline" color="black"></v-icon>
      </template>
      See the graph to the right? This is a visualization of the structure of a Julia package. You can
      navigate it by dragging the background or zoom in and out using your mouse wheel.
      Click on a node in the graph to display more details in this pane. To see this info pane again,
      click on the background.
      You can drag-and-drop the nodes to rearrange the graph.
    </v-list-item>

    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-chevron-double-right" color="blue"></v-icon>
      </template>
      To resize this drawer, drag the arrows in the middle-right of the drawer.
    </v-list-item>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-play" color="blue"></v-icon>
      </template>
      Use the top-right play/pause button to stop or continue the simulation updating the node positions.
    </v-list-item>

    <v-divider></v-divider>
    <v-list-subheader>Node-Types:</v-list-subheader>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-file" color="blue"></v-icon>
      </template>
      These are source files that are part of the package. Clicking on them will show the contents of the
      file in
      the editor and some meta information. The area of the file symbols corresponds to the number of
      <i>lines of code</i>.

    </v-list-item>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-file" color="white"></v-icon>
      </template>
      <v-list>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-file" color="red"></v-icon>
          </template>
          The currently selected node is highlighted in red (not limited to files).
        </v-list-item>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-file" color="grey"></v-icon>
          </template>
          Source files that are not included in the package or are of an unknown file type are shown
          in grey.
        </v-list-item>
      </v-list>
    </v-list-item>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-folder" color="orange"></v-icon>
      </template>
      These are folders in the package. Clicking on them will show other files and folders inside. You can
      click on them to navigate further. Ingoing edges (edges to parent folders) of the selected folder
      are highlighted in red and outgoing edges are highlighted in green.
    </v-list-item>
    <v-list-item>
      <template v-slot:prepend>
        <v-icon icon="mdi-circle" color="grey"></v-icon>
      </template>
      These are julia methods.
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { Graph, NodeDatum } from "../Graph/build";
import { useGraphStore } from '../../plugins/store';


const props = defineProps<{}>()
const emit = defineEmits(['update:selection']);
const store = useGraphStore()

const loading = ref(false);
const thinking = computed(() => loading.value || !hasModel.value);
const hasModel = computed(() => store.graph != null);

const output = ref('');

async function submit() {
  store.$state.renderGraph = false
  loading.value = true;
  output.value = "";

  const response = await fetch(`/analyze/${store.$state.name}`);
  if (!response.body) {
    alert("No response body!");
    return;
  }
  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    // value is a Uint8Array. Convert it to a string and output it.
    const text = new TextDecoder().decode(value);
    output.value += text
    nextTick(() => {
      const textarea = document.querySelector("#console-textarea") as HTMLTextAreaElement;
      if (textarea) textarea.scrollTop = textarea.scrollHeight;
    })
  }

  loading.value = false;
  store.$state.renderGraph = true
}

function go_to_module() {
  if (store.$state.graph)
    emit("update:selection", store.$state.graph.nodes.find(n => n.details.what == "folder" && n.details.name == store.$state.name));
  else alert("No graph loaded!")
}

</script>


<style scoped>
.v-textarea {
  background-color: black;
  color: white;
  overflow-y: auto;
}
</style>
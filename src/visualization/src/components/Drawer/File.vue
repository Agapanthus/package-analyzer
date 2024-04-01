<template>
  <template v-if="details.file_details">
    <v-divider></v-divider>

    <v-list-item>
      Lines of Code: {{ details.file_details.code }}
    </v-list-item>
    <v-list-item>
      Blank Lines: {{ details.file_details.blanks }}
    </v-list-item>
    <v-list-item>
      Comment Lines: {{ details.file_details.comment }}
    </v-list-item>
    <v-list-item>
      Language: {{ details.file_details.language }}
    </v-list-item>

    <v-divider></v-divider>

    <v-expansion-panels v-model="expanded">
      <v-expansion-panel title="Source">
        <v-expansion-panel-text>
          <codemirror v-model="details.file_details.text" placeholder="Code goes here..." :autofocus="false"
            :indent-with-tab="false" :tab-size="2" :disabled="true" :extensions="[juliaParser()]" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>


    <v-divider></v-divider>

    <v-list-subheader>Exports:</v-list-subheader>


  </template>
</template>
<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { julia as juliaParser } from "@plutojl/lang-julia"
import { Codemirror } from 'vue-codemirror'
import { Details } from '../Graph/build';

const expanded = ref(false);
const props = defineProps<{
  details: Details
}>()
</script>
<template>
  <VResizeDrawer v-model="drawer" :saveWidth="true" width="500px" min-width="500px">
    <Info @update:selection="value => emit('update:modelValue', value)" v-if="modelValue == null" />
    <v-list v-else>
      <v-list-item :title="modelValue.details.what + ': ' + modelValue.details.name"
        :subtitle="modelValue.details.path + (modelValue.details.line >= 0 ? ('@' + modelValue.details.line) : '')">
        <template v-slot:prepend>
          <v-icon :icon="modelValue.details.icon"></v-icon>
        </template>
      </v-list-item>

      <Folder :d="modelValue" v-if="modelValue.details.what == 'folder'" />
      <File :details="modelValue.details" v-else-if="modelValue.details.what == 'file'" />
      <Method :d="modelValue" v-else-if="modelValue.details.what == 'method'" />
      <pre v-else>{{ JSON.stringify(modelValue.details, null, 2) }}</pre>

      <v-divider></v-divider>

      <v-list-subheader>Parent:</v-list-subheader>

      <v-list-item v-if="modelValue.parent" link @click="emit('update:modelValue', modelValue.parent)"
        density="compact">
        <template v-slot:prepend>
          <v-icon :icon="modelValue.parent.details.icon"></v-icon>
        </template>
        <v-list-item-title v-text="modelValue.parent.details.name"></v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-subheader>Children:</v-list-subheader>

      <v-list-item v-for="child in modelValue.children" link @click="emit('update:modelValue', child)"
        density="compact">
        <template v-slot:prepend>
          <v-icon :icon="child.details.icon"></v-icon>
        </template>
        <v-list-item-title v-text="child.details.name"></v-list-item-title>
      </v-list-item>


    </v-list>
  </VResizeDrawer>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { NodeDatum } from "../Graph/build";

const props = defineProps<{
  modelValue: NodeDatum | null,
}>()

const emit = defineEmits(['update:modelValue']);

const drawer = ref(true);

</script>
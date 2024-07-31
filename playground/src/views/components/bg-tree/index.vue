<template>
  <div class="bg-tree">
    <list :data="treeData" :props="propsConfig">
      <template v-if="$slots.label" #label="{ data, level }">
        <slot name="label" :data="data" :level="level" />
      </template>
    </list>
  </div>
</template>

<script setup>
import List from "./list.vue";
import { computed } from "vue";

defineOptions({
  name: "BgTree"
});

const props = defineProps({
  data: {
    type: Array,
    default: () => ([])
  },
  props: {
    type: Object,
    default: () => ({})
  }
});

const treeData = computed(() => props.data);

const propsConfig = computed(() => ({
  label: "label",
  value: "value",
  children: "children",
  ...props.props
}));
</script>

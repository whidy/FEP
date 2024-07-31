<template>
  <ul class="bg-tree-list">
    <li v-for="(item, index) in  treeData ">
      <div class="bg-tree-node">
        <a class="bg-tree-node-icon" :class="{ 'is-right': !showChildren[index] }"
          @click="showChildren[index] = !showChildren[index]" v-if="item[propsConfig['children']]" />
        <template v-if="$slots.label">
          <slot name="label" :level="level" :data="item" />
        </template>
        <template v-else>
          <p class="bg-tree-node-label">{{ item[propsConfig["label"]] }}</p>
        </template>
      </div>
      <list :data="item[propsConfig['children']]" :props="propsConfig" :level="level + 1"
        v-if="item[propsConfig['children']]" v-show="showChildren[index]">
        <template v-if="$slots.label" #label="{ data, level }">
          <slot name="label" :level="level" :data="data" />
        </template>
      </list>
    </li>
  </ul>
</template>

<script setup>
import List from "./list.vue";
import { ref, computed, watch } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  props: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 1
  }
});

const treeData = computed(() => props.data);

const propsConfig = computed(() => ({
  label: "label",
  value: "value",
  children: "children",
  ...props.props
}));

const showChildren = ref([]);

watch(() => props.data, () => {
  showChildren.value = props.data.map((v, i) => showChildren.value[i] === false ? false : true);
}, {
  deep: true,
  immediate: true
})
</script>

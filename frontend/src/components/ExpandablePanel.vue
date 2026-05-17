<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  defaultExpanded?: boolean
}>(), {
  defaultExpanded: false,
})

const isExpanded = ref(props.defaultExpanded)

function toggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="expandable-panel rounded-xl border border-border overflow-hidden">
    <div
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
      @click="toggle"
    >
      <slot name="header">
        <span class="text-sm font-medium text-text-primary">{{ title }}</span>
      </slot>
      <ChevronDown
        :size="18"
        class="text-text-secondary transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
      />
    </div>
    <div
      class="overflow-hidden transition-all duration-300 ease-out"
      :style="{ maxHeight: isExpanded ? '1000px' : '0px' }"
    >
      <div class="p-4 pt-0">
        <slot />
      </div>
    </div>
  </div>
</template>

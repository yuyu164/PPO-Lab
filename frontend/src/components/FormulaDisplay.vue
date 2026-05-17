<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps<{
  formula: string
  highlight?: string
  highlightValue?: string | number
}>()

const containerRef = ref<HTMLElement | null>(null)

function renderFormula() {
  if (!containerRef.value || !props.formula) return
  let tex = props.formula
  if (props.highlight && props.highlightValue !== undefined) {
    tex = tex.replace(props.highlight, `\\textcolor{#3B82F6}{\\mathbf{${props.highlightValue}}}`)
  }
  try {
    katex.render(tex, containerRef.value, { throwOnError: false, displayMode: true })
  } catch {
    containerRef.value.textContent = props.formula
  }
}

onMounted(renderFormula)
watch(() => [props.formula, props.highlight, props.highlightValue], renderFormula)
</script>

<template>
  <div ref="containerRef" class="formula-display text-center py-2" />
</template>

<style scoped>
.formula-display :deep(.katex) {
  font-size: 1.1em;
  color: #F1F5F9;
}
</style>

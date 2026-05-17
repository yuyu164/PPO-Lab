import { onUnmounted } from 'vue'
import gsap from 'gsap'

export function useAnimation() {
  const timelines: gsap.core.Timeline[] = []

  function createTimeline(options?: gsap.TimelineVars) {
    const tl = gsap.timeline(options)
    timelines.push(tl)
    return tl
  }

  onUnmounted(() => {
    timelines.forEach(tl => tl.kill())
  })

  return { gsap, createTimeline }
}

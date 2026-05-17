import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useIntersection(
  elementRef: Ref<HTMLElement | null>,
  options?: IntersectionObserverInit
) {
  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (elementRef.value) {
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting.value = entry.isIntersecting
      }, { threshold: 0.2, ...options })
      observer.observe(elementRef.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isIntersecting }
}

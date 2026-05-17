import { defineStore } from 'pinia'

interface AppState {
  currentSection: string
  sectionProgress: number[]
  isNavScrolled: boolean
  prefersReducedMotion: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    currentSection: 'hero',
    sectionProgress: [0, 0, 0, 0, 0],
    isNavScrolled: false,
    prefersReducedMotion: false,
  }),

  getters: {
    sectionProgressPercent(state): number {
      const visited = state.sectionProgress.filter(p => p >= 1).length
      return Math.round((visited / state.sectionProgress.length) * 100)
    },
    isSectionVisited: (state) => {
      return (sectionId: string): boolean => {
        const sectionMap: Record<string, number> = {
          alignment: 0,
          'quad-model': 1,
          'kl-controller': 2,
          'gae-retracer': 3,
          training: 4,
        }
        const index = sectionMap[sectionId]
        return index !== undefined ? state.sectionProgress[index] >= 1 : false
      }
    },
  },

  actions: {
    setCurrentSection(sectionId: string) {
      this.currentSection = sectionId
    },
    markSectionVisited(sectionId: string) {
      const sectionMap: Record<string, number> = {
        alignment: 0,
        'quad-model': 1,
        'kl-controller': 2,
        'gae-retracer': 3,
        training: 4,
      }
      const index = sectionMap[sectionId]
      if (index !== undefined) this.sectionProgress[index] = 1
    },
    setNavScrolled(scrolled: boolean) {
      this.isNavScrolled = scrolled
    },
    initReducedMotion() {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.prefersReducedMotion = mq.matches
      mq.addEventListener('change', (e) => { this.prefersReducedMotion = e.matches })
    },
  },
})

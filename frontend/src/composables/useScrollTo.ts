export function useScrollTo() {
  function scrollTo(selector: string, offset: number = 80) {
    const element = document.getElementById(selector)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return { scrollTo }
}

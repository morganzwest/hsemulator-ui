import { useEffect, useState } from 'react'

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e) {
      const target = e.target
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !isEditable) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen }
}

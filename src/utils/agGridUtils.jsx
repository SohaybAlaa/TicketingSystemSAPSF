import { renderToStaticMarkup } from 'react-dom/server'

export function buildGridOverlay({ icon: Icon, heading, sub }) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                gap:10px;padding:32px;color:#6b7280;">
      ${renderToStaticMarkup(<Icon size={40} style={{ color: '#fdc700' }} />)}
      <span style="font-size:20px;font-weight:600;">${heading}</span>
      <span style="font-size:18px;color:#9ca3af;">${sub}</span>
    </div>
  `
}

export const defaultColDef = {
  sortable: true, resizable: true, filter: true,
  floatingFilter: false, suppressMovable: false,
}

export const getRowStyle = (params) => ({ cursor: params.data?._skeleton ? 'default' : 'pointer' })

export function getScrollParent(el) {
  if (!el || !(el instanceof Element)) return window

  let parent = el.parentElement

  while (parent && parent !== document.documentElement) {
    try {
      const style = window.getComputedStyle(parent)
      const { overflow, overflowY, overflowX } = style
      const position = style.position

      const isScrollable = /(auto|scroll)/.test(overflow + overflowY + overflowX)
      
      if (isScrollable && parent.scrollHeight > parent.clientHeight) {
        return parent
      }

      if (position === 'fixed') {
        return window
      }
    } catch (err) {
      console.warn('Error checking scroll parent:', err)
    }

    parent = parent.parentElement
  }

  return window
}

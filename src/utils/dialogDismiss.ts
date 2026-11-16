type DialogDismissEvent = Pick<globalThis.MouseEvent, 'target' | 'clientX' | 'clientY' | 'preventDefault' | 'stopImmediatePropagation'>

export function dismissDialogOnOutsideClick(event: DialogDismissEvent): boolean {
  const dialog = event.target
  if (!(dialog instanceof globalThis.HTMLDialogElement) || !dialog.open) return false
  const bounds = dialog.getBoundingClientRect()
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom
  if (inside) return false

  event.preventDefault()
  event.stopImmediatePropagation()
  if (typeof dialog.requestClose === 'function') dialog.requestClose()
  else if (dialog.dispatchEvent(new globalThis.Event('cancel', { cancelable: true }))) dialog.close()
  return true
}

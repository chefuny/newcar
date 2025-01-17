import type { Canvas, CanvasKit } from 'canvaskit-wasm'
import type { Widget } from './widget'
import { isAsyncFunction } from '@newcar/utils'
import { AsyncWidget, AsyncWidgetResponse } from './asyncWidget'

export const initial = async (
  widget: Widget | AsyncWidget,
  ck: CanvasKit,
  canvas: Canvas,
) => {
  !widget._isAsyncWidget()
    ? widget.init(ck)
    : await (async () => {
        const res = await widget.init(ck)
        if ((res as AsyncWidgetResponse).status === 'error') {
          console.warn(
            '[Newcar Warn] Failed to laod async widget, please check if your network.',
          )
        }
      })()
  for (const child of widget.children) {
    await initial(child, ck, canvas)
  }
}

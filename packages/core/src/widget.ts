import type { Canvas, CanvasKit } from 'canvaskit-wasm'
import type { Animation, AnimationInstance } from './animation'
import { isNull } from '@newcar/utils'
import { deepClone } from './utils/deepClone'

export let widgetCounter = 0

export type WidgetInstance<T extends Widget> = T

export interface WidgetOptions {
  style?: WidgetStyle
  x?: number
  y?: number
  centerX?: number
  centerY?: number
  progress?: number
  children?: Widget[]
}

export interface WidgetStyle {
  scaleX?: number
  scaleY?: number
  rotation?: number
  transparency?: number
}

export class Widget {
  x: number // The vector x of the widget.
  y: number // The vector y of the widget.
  centerX: number // The center vector x of the widget.
  centerY: number // The center vector y of the widget.
  progress: number // The progress/process of a widget.
  style: WidgetStyle = {
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    transparency: 1,
  } // The style of the widget.
  display = true
  isImplemented = false // If the widget is implemented by App.impl
  animationInstances: AnimationInstance[] = []
  updates: ((elapsed: number, widget: Widget) => void)[] = []
  key = `widget-${++widgetCounter}-${performance.now()}-${Math.random()
    .toString(16)
    .slice(2)}`

  constructor(options?: WidgetOptions) {
    options ??= {}
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.centerX = options.centerX ?? 0
    this.centerY = options.centerY ?? 0
    this.progress = options.progress ?? 1
    this.children = options.children ?? []
    options.style ??= {}
    this.style.scaleX = options.style.scaleX ?? 1
    this.style.scaleY = options.style.scaleY ?? 1
    this.style.rotation = options.style.rotation ?? 0
    this.style.transparency = options.style.transparency ?? 1
  }

  /**
   * The child-widgets of the widget.
   */
  children: Widget[] = []

  last: Widget = this

  /**
   * Called when the widget is registered.
   * @param CanvasKit The CanvasKit namespace
   */
  init(ck: CanvasKit) {}

  /**
   * Preload the necessary items during drawing.
   * Called when the properties of the widget is changed.
   * In common, we use it to initializing Paint, Rect, Path, etc.
   * @param CanvasKit The namespace of CanvasKit-WASM.
   * @param propertyChanged The changed property of this widget
   */

  predraw(ck: CanvasKit, propertyChanged: string) {}

  /**
   * Draw the object according to the parameters of the widget.
   * Called when the parameters is changed.
   * @param canvas The canvas object of CanvasKit-WASM.
   */
  draw(canvas: Canvas) {}

  /**
   * Called when the parameters is changed.
   * @param ck The namespace of CanvasKit-WASM.
   */
  preupdate(ck: CanvasKit, propertyChanged?: string) {
    this.predraw(ck, propertyChanged)
  }

  /**
   * Update the object according to the style of the widget.
   * Called when the style is changed.
   * @param canvas The canvas object of CanvasKit-WASM.
   * @param propertyChanged The changed property of this widget
   */
  update(canvas: Canvas) {
    canvas.translate(this.x, this.y)
    canvas.rotate(this.style.rotation, this.centerX, this.centerY)
    canvas.scale(this.style.scaleX, this.style.scaleY)
    if (this.display) {
      this.draw(canvas)
    }
  }

  /**
   * Add children widgets for the widget.
   * @param children The added children.
   */
  add(...children: Widget[]): this {
    for (const child of children) {
      this.children.push(child)
    }

    return this
  }

  animate(
    animation: Animation<Widget>,
    startAt: number,
    during: number,
    params?: Record<string, any>,
  ): this {
    params ??= {}
    this.animationInstances.push({
      startAt,
      during,
      animation,
      params: params,
      mode: params.mode ?? 'positive',
    })

    return this
  }

  runAnimation(elapsed: number) {
    for (const instance of this.animationInstances) {
      if (
        instance.startAt <= elapsed &&
        instance.during + instance.startAt >= elapsed
      ) {
        if (instance.mode === 'positive') {
          instance.animation.act(
            this,
            elapsed - instance.startAt,
            (elapsed - instance.startAt) / instance.during,
            instance.params,
          )
        } else if (instance.mode === 'reverse') {
          instance.animation.act(
            this,
            elapsed - instance.startAt,
            1 - (elapsed - instance.startAt) / instance.during,
            instance.params,
          )
        }
      }
    }
    for (const update of this.updates) {
      update(elapsed, this)
    }
    for (const child of this.children) {
      child.runAnimation(elapsed)
    }
  }

  /**
   * Set up a update function to call it when the widget is changed.
   * @param updateFunc The frame from having gone to current frame.
   */
  setUpdate(updateFunc: (elapsed: number, widget: Widget) => void): this {
    this.updates.push(updateFunc)

    return this
  }

  _isAsyncWidget() {
    return false
  }

  show(): this {
    this.display = true
    return this
  }

  hide(): this {
    this.display = false
    return this
  }

  copy() {
    return deepClone(this)
  }
}

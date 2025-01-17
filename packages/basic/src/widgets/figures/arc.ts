import { Canvas, CanvasKit, Paint, RRect } from 'canvaskit-wasm'
import { Figure, FigureOptions } from './figure'

export class Arc extends Figure {
  private rect: RRect

  constructor(
    public radius: number,
    public from: number,
    public to: number,
    options?: FigureOptions,
  ) {
    super(options)
  }

  init(ck: CanvasKit): void {
    // Stroke
    this.strokePaint = new ck.Paint()
    this.strokePaint.setStyle(ck.PaintStyle.Stroke)
    this.strokePaint.setColor(this.style.borderColor.toFloat4())
    this.strokePaint.setStrokeWidth(this.style.borderWidth)
    this.strokePaint.setAlphaf(this.style.transparency)

    try {
      const dash = ck.PathEffect.MakeDash(
        this.style.interval,
        this.style.offset,
      )
      this.strokePaint.setPathEffect(dash)
    } catch {}

    // Fill
    this.fillPaint = new ck.Paint()
    this.fillPaint.setColor(this.style.fillColor.toFloat4())
    this.fillPaint.setStyle(ck.PaintStyle.Fill)
    this.fillPaint.setAlphaf(this.style.transparency)

    this.rect = ck.LTRBRect(
      -this.radius,
      -this.radius,
      this.radius,
      this.radius,
    )
  }

  predraw(ck: CanvasKit, propertyChanged?: string): void {
    switch (propertyChanged) {
      case 'radius': {
        this.rect.set([-this.radius, -this.radius, this.radius, this.radius])
        break
      }
      case 'style.borderColor': {
        this.strokePaint.setColor(this.style.borderColor.toFloat4())
        break
      }
      case 'style.borderWidth': {
        this.strokePaint.setStrokeWidth(this.style.borderWidth)
        break
      }
      case 'style.fillColor': {
        this.fillPaint.setColor(this.style.fillColor.toFloat4())
        break
      }
      case 'style.offset':
      case 'style.interval': {
        this.strokePaint.setPathEffect(
          ck.PathEffect.MakeDash(this.style.interval, this.style.offset),
        )
      }
    }
    this.strokePaint.setAlphaf(this.style.transparency)
    this.fillPaint.setAlphaf(this.style.transparency)
  }

  draw(canvas: Canvas): void {
    if (this.style.border) {
      canvas.drawArc(
        this.rect,
        this.from,
        this.to * this.progress,
        false,
        this.strokePaint,
      )
    }
    if (this.style.fill) {
      canvas.drawArc(
        this.rect,
        this.from,
        this.to * this.progress,
        false,
        this.fillPaint,
      )
    }
  }
}

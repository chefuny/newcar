import {
  $source,
  AsyncWidget,
  AsyncWidgetResponse,
  Widget,
  WidgetOptions,
  WidgetStyle,
} from '@newcar/core'
import { Color, isString, isUndefined } from '@newcar/utils'
import type {
  TextAlign,
  TextDirection,
  TextHeightBehavior,
  TextBaseline,
} from '../utils/types'
import type {
  CanvasKit,
  FontMgr,
  StrutStyle,
  TextStyle as ckTextStyle,
  ParagraphStyle as ckParagraphStyle,
  DecorationStyle,
  TextFontFeatures,
  FontStyle,
  TextFontVariations,
  TextShadow,
  ParagraphBuilder,
  Canvas,
  Paragraph as ckParagraph,
  Paint,
} from 'canvaskit-wasm'
import {
  str2TextAlign,
  str2TextBaseline,
  str2TextDirection,
  str2TextHeightBehavior,
} from '../utils/trans'

export interface InputItem {
  text: string
  style: TextItemStyle
}
interface TextItemStyle {
  backgroundColor?: Color
  color?: Color
  decoration?: number
  decorationColor?: Color
  decorationThickness?: number
  decorationStyle?: DecorationStyle
  fontFamilies?: string[]
  fontFeatures?: TextFontFeatures[]
  fontSize?: number
  fontStyle?: FontStyle
  fontVariations?: TextFontVariations[]
  foregroundColor?: Color
  heightMultiplier?: number
  halfLeading?: boolean
  letterSpacing?: number
  locale?: string
  shadows?: TextShadow[]
  textBaseline?: TextBaseline
  wordSpacing?: number
}

export interface TextOptions extends WidgetOptions {
  style?: TextStyle
}

export interface TextStyle extends WidgetStyle {
  offset?: number
  interval?: number[]
  fill?: boolean
  border?: boolean
  fillColor?: Color
  borderWidth?: number
  borderColor?: Color
  disableHinting?: boolean
  ellipsis?: string
  heightMultiplier?: number
  maxLines?: number
  replaceTabCharacters?: boolean
  strutStyle?: StrutStyle
  textAlign?: TextAlign
  textDirection?: TextDirection
  textHeightBehavior?: TextHeightBehavior
  applyRoundingHack?: boolean
  width?: number
}
export class Text extends Widget {
  private text: InputItem[] = []
  private fontManager: FontMgr
  declare style: TextStyle
  private builder: ParagraphBuilder
  private paragraph: ckParagraph
  disableHinting?: boolean
  ellipsis?: string
  heightMultiplier?: number
  maxLines?: number
  replaceTabCharacters?: boolean
  strutStyle?: StrutStyle
  textAlign?: TextAlign
  textDirection?: TextDirection
  textHeightBehavior?: TextHeightBehavior
  applyRoundingHack?: boolean
  width?: number
  offset?: number
  interval?: number[]

  strokePaint: Paint
  fillPaint: Paint

  constructor(
    text: (string | InputItem)[],
    private inputOptions?: TextOptions,
  ) {
    inputOptions ??= {}
    super(inputOptions)
    inputOptions.style ??= {}
    this.disableHinting = inputOptions.style.disableHinting ?? false
    this.ellipsis = inputOptions.style.ellipsis ?? null
    this.heightMultiplier = inputOptions.style.heightMultiplier ?? 1.0
    this.maxLines = inputOptions.style.maxLines ?? null
    this.replaceTabCharacters = inputOptions.style.replaceTabCharacters ?? true
    this.strutStyle = inputOptions.style.strutStyle ?? null
    this.applyRoundingHack = inputOptions.style.applyRoundingHack ?? false
    this.width = inputOptions.style.width ?? 1000
    this.style.borderColor = inputOptions.style.borderColor ?? Color.WHITE
    this.style.borderWidth = inputOptions.style.borderWidth ?? 2
    this.style.fillColor = inputOptions.style.fillColor ?? Color.WHITE
    this.style.fill = inputOptions.style.fill ?? true
    this.style.border = inputOptions.style.border ?? false
    this.style.interval = [1, 0]
    this.style.offset = 0
    for (const item of text) {
      if (isString(item)) {
        this.text.push({
          text: item.toString(),
          style: {
            fontSize: 50,
          },
        })
      } else {
        this.text.push(item as InputItem)
      }
    }
  }

  init(ck: CanvasKit) {
    this.textAlign = this.inputOptions.style.textAlign ?? 'start'
    this.textDirection = this.inputOptions.style.textDirection ?? 'ltr'
    this.textHeightBehavior =
      this.inputOptions.style.textHeightBehavior ?? 'all'
    this.fontManager = ck.FontMgr.FromData(...$source.fonts)
    this.builder = ck.ParagraphBuilder.Make(
      new ck.ParagraphStyle({
        ...this.style,
        ...{
          textAlign: str2TextAlign(ck, this.textAlign),
          textDirection: str2TextDirection(ck, this.textDirection),
          textHeightBehavior: str2TextHeightBehavior(
            ck,
            this.textHeightBehavior,
          ),
        },
      }),
      this.fontManager,
    )
    for (const item of this.text) {
      this.builder.pushStyle(
        new ck.TextStyle({
          ...item.style,
          ...{
            backgroundColor: isUndefined(item.style.backgroundColor)
              ? ck.Color4f(1, 1, 1, 0)
              : item.style.backgroundColor.toFloat4(),
            color: isUndefined(item.style.color)
              ? ck.Color4f(1, 1, 1, 1)
              : item.style.color.toFloat4(),
            decorationColor: isUndefined(item.style.decorationColor)
              ? ck.Color4f(1, 1, 1, 0)
              : item.style.decorationColor.toFloat4(),
            foregroundColor: isUndefined(item.style.foregroundColor)
              ? ck.Color4f(1, 1, 1, 1)
              : item.style.foregroundColor.toFloat4(),
            textBaseline: isUndefined(item.style.textBaseline)
              ? ck.TextBaseline.Alphabetic
              : str2TextBaseline(ck, item.style.textBaseline),
          },
        }),
      )
      this.builder.addText(item.text)
      // TODO: Stroke and Fill
    }

    this.paragraph = this.builder.build()
  }

  predraw(ck: CanvasKit, propertyChanged: string): void {
    switch (propertyChanged) {
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
        break
      }
      case 'disableHinting':
      case 'ellipsis':
      case 'heightMultiplier':
      case 'maxLines':
      case 'replaceTabCharacters':
      case 'strutStyle':
      case 'textAlign':
      case 'textDirection':
      case 'textHeightBehavior':
      case 'applyRoundingHack':
      // case 'textStyle': {
      //   this.builder = ck.ParagraphBuilder.Make(
      //     new ck.ParagraphStyle({
      //       ...this.style,
      //       ...{
      //         textAlign: str2TextAlign(this.style.textAlign),
      //         textDirection: str2TextDirection(this.style.textDirection),
      //         textHeightBehavior: str2TextHeightBehavior(this.style.textHeightBehavior),
      //         textStyle:
      //       }
      //     }),
      //     this.fontManager,
      //   )
      //   break
      // }
    }
  }

  draw(canvas: Canvas): void {
    this.paragraph.layout(this.width)
    canvas.drawParagraph(this.paragraph, 0, 0)
  }
}

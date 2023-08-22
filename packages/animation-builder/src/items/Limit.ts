import type { IMathImageLimit } from "@newcar/objects/src/objects/mathImage/interface";

import type { AnimationBuilder } from "..";
import { Interpolator } from "../interpolation/Interpolator";
import { LinearInterpolator } from "../interpolation/LinearInterpolator";
import { AnimationBuilderItem } from "../item";

export class Limit extends AnimationBuilderItem {
  #obj: IMathImageLimit;
  #interpolatorstart: Interpolator;
  #interpolatorend: Interpolator;
  #length: number;
  #start: number;

  constructor(
    obj: IMathImageLimit,
    datas: {
      startAt?: number;
      lastsFor?: number;
      from?: [number, number];
      to?: [number, number];
      by?: (x: number) => number;
    },
  ) {
    super();
    if (
      datas.to === undefined ||
      datas.from === undefined ||
      datas.lastsFor === undefined ||
      datas.startAt === undefined
    ) {
      throw new Error("This animation is missing necessary values");
    }
    this.#length = datas.lastsFor - datas.startAt;
    this.#start = datas.startAt;
    this.#obj = obj;
    this.#interpolatorstart = new Interpolator(
      datas.from[0],
      datas.to[0],
      datas.by ?? LinearInterpolator,
    );
    this.#interpolatorend = new Interpolator(
      datas.from[1],
      datas.to[1],
      datas.by ?? LinearInterpolator,
    );
  }

  onDrawFrame(relativeFrameCount: number, _parent: AnimationBuilder): void {
    this.#obj.startVariable = this.#interpolatorstart.interpolate(
      (relativeFrameCount + 1) / this.#length,
    );
    this.#obj.endVariable = this.#interpolatorend.interpolate(
      (relativeFrameCount + 1) / this.#length,
    );
  }

  get startFrame(): number {
    return this.#start;
  }

  get length(): number {
    return this.#length;
  }
}

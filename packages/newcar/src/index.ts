import type { Carobj } from "@newcar/basic/src/objects/carobj";
import { Car } from "@newcar/core/src/car";
import { Scene } from "@newcar/core/src/scene";

export * from "@newcar/basic/src";
export { Scene } from "@newcar/core/src";
export * from "@newcar/recorder/src";
export * from "@newcar/utils/src";

export const newcar = (
  element: HTMLCanvasElement | string,
  sceneOrObjects?: Scene | Carobj[],
): Car =>
  new Car(
    typeof element === "string" ? document.querySelector(element)! : element,
    sceneOrObjects === undefined
      ? new Scene()
      : Array.isArray(sceneOrObjects)
      ? new Scene(sceneOrObjects)
      : sceneOrObjects,
  );

// eslint-disable-next-line no-console
console.log(
  `   ____  ___ _      ___________ ______
  / __ \\/ _ \\ | /| / / ___/ __  / ___/
 / / / /  __/ |/ |/ / /__/ /_/ / /    
/_/ /_/\\___/|__/|__/\\___/\\__,_/_/

%cThe animation is powered by %c newcar %c v0.6.0 %c

link: https://github.com/Bug-Duck/newcar

Click here to jump to our Twitter: https://twitter.com/bugduckteam
 `,
  "font-size: 14px",
  "background-color: orange; padding: 7px; font-size: 14px",
  "background-color: grey; padding: 7px; font-size: 14px",
  "",
);

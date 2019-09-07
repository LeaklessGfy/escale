import { Physics, Scene, GameObjects, Display } from 'phaser';
import Liquid from './Liquid';

const SIZE = 2;

const TOP_LEFT_X = 0;
const TOP_RIGHT_X = 45;
const BOTTOM_LEFT_X = 15;
const BOTTOM_RIGHT_X = 30;

const TOP_Y = 0;
const BOTTOM_Y = 40;

export default class Glass extends Physics.Arcade.Sprite {
  private colors: Map<number, integer> = new Map();
  private g: GameObjects.Graphics;
  private level = 1;

  constructor(scene: Scene, x: integer, y: integer, texture: string) {
    super(scene, x, y, texture);

    this.setOrigin(0,0);
    this.setInteractive();
    scene.input.setDraggable(this);
    scene.physics.add.existing(this);

    (this.body as Physics.Arcade.Body).allowGravity = false;
    (this.body as Physics.Arcade.Body).collideWorldBounds = true;
    this.g = this.scene.add.graphics();
    this.on('drag', this.onDrag, this);
  }

  fill(liquid: Liquid) {
    if (this.level > this.height - SIZE) {
      return;
    }
    this.addColor(liquid.fillColor);
    this.updateGraphics(this.mixColor());
    this.level++;
  }

  private addColor(color: number) {
    if (!this.colors.has(color)) {
      this.colors.set(color, 1);
    } else {
      this.colors.set(color, this.colors.get(color) + 1);
    }
  }

  private mixColor(): number {
    const mixColor = {r: 0, g: 0, b: 0};
    let total = 0;

    for (const [color, frequency] of this.colors.entries()) {
      const rgb = Display.Color.IntegerToRGB(color);
      mixColor.r += (rgb.r * frequency);
      mixColor.g += (rgb.g * frequency);
      mixColor.b += (rgb.b * frequency);
      total += frequency;
    }

    mixColor.r /= total;
    mixColor.g /= total;
    mixColor.b /= total;

    return Display.Color.GetColor(mixColor.r, mixColor.g, mixColor.b);
  }

  private updateGraphics(color: number) {
    if (!this.g.body) {
      this.parentContainer.add(this.g);
      this.scene.physics.add.existing(this.g);
      const body = <Physics.Arcade.Body> this.g.body;
      body.allowGravity = false;
      body.collideWorldBounds = true;
      body.width = this.width;
      body.height = this.height;
    }

    this.g.clear();
    this.g.defaultFillColor = color;
    const topY = BOTTOM_Y - this.level - SIZE;

    let diff = (this.height - topY) / 2;
    diff = diff + SIZE;

    let topLX = BOTTOM_LEFT_X - (this.level - diff);
    let topRX = BOTTOM_RIGHT_X + (this.level - diff);

    const points = [
      {x: topLX, y: topY},
      {x: BOTTOM_LEFT_X, y: BOTTOM_Y},
      {x: BOTTOM_RIGHT_X, y: BOTTOM_Y},
      {x: topRX, y: topY}
    ];

    this.g.fillPoints(points);
  }

  private onDrag(_: Phaser.Input.Pointer, dragX: integer, dragY: integer) {
    this.x = dragX;
    this.y = dragY;
    this.g.x = dragX;
    this.g.y = dragY;
  }

  static build(scene: Scene, container: GameObjects.Container) {
    if (!scene.textures.exists('glass')) {
      const style = {
        fillStyle: {
          color: 0x0000FF,
          alpha: 1
        },
        lineStyle: {
          width: SIZE,
          color: 0xffffff,
          alpha: 1
        }
      };
      const points = [
        {x: TOP_LEFT_X, y: TOP_Y},
        {x: BOTTOM_LEFT_X, y: BOTTOM_Y},
        {x: BOTTOM_RIGHT_X, y: BOTTOM_Y},
        {x: TOP_RIGHT_X, y: TOP_Y}
      ];
      
      scene.add
        .graphics(style)
        .strokePoints(points, false, false)
        .generateTexture('glass', 47, 43)
        .destroy();
    }

    const glass = new Glass(scene, 0, 0, 'glass');
    container.add(glass);

    return glass;
  }
}
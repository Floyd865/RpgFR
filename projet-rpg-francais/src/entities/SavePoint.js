export default class SavePoint {
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.staticSprite(x, y, 'point_sauvegarde');
  }
}
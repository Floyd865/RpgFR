export default class NPC {
  constructor(scene, donneesPnj) {
    this.scene = scene;
    this.id = donneesPnj.id;
    this.nom = donneesPnj.nom;
    this.dialogue = donneesPnj.dialogue;

    this.sprite = scene.physics.add.staticSprite(
      donneesPnj.position.x,
      donneesPnj.position.y,
      donneesPnj.sprite
    );
  }
}
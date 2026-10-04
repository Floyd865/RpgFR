export default class HealthSystem {
  constructor(config = {}) {
    this.hpMax = config.hpMax ?? 15;
    this.hp = config.hp ?? this.hpMax;
  }

  soigner(valeur) {
    this.hp = Math.min(this.hp + valeur, this.hpMax);
  }

  subirDegat(valeur = 1) {
    this.hp = Math.max(this.hp - valeur, 0);
  }

  estMort() {
    return this.hp <= 0;
  }

  getEtat() {
    return { hp: this.hp, hpMax: this.hpMax };
  }
}
/**
 * fog.ts
 *
 * Névoa avermelhada fora de um círculo, usando GeometryMask invertido.
 *
 * Uso em create():
 *   this.fog = createFogCircle(this, 400, 300, 200);
 *
 * Uso em update() para seguir o player:
 *   updateFogCircle(this.fog, this.player.x, this.player.y, 200);
 * 
 * 
 * // verifica se esta na zona de perigo e emite um (log use F12 para ver)
    checkFogCollision(this.fog, this.player.x, this.player.y);
 */



export interface FogCircle {
  overlay:  Phaser.GameObjects.Graphics;
  mask:     Phaser.GameObjects.Graphics;
  cx:       number;   // ← adicione
  cy:       number;   // ← adicione
  diameter: number;   // ← adicione
  inFog:    boolean;  // ← adicione
}
// Tamanho total do mapa em pixels — ajuste se mudar o mapa
const MAP_W = 2720;
const MAP_H = 1536;

/**
 * Cria a névoa.
 * @param scene    cena Phaser ativa
 * @param cx       centro X em pixels do mundo
 * @param cy       centro Y em pixels do mundo
 * @param diameter diâmetro do círculo visível em pixels
 * @param alpha    transparência da névoa (0 = invisível, 1 = sólido) — padrão 0.4
 */
export const createFogCircle = (
  scene:    Phaser.Scene,
  cx:       number,                                         
  cy:       number,
  diameter: number,
  alpha:    number = 0.4                    
): FogCircle => {
  const radius = diameter / 2;

  // 1. Círculo que define a área VISÍVEL (será usado como máscara)
  const maskShape = scene.add.graphics();
  maskShape.fillStyle(0xffffff);
  maskShape.fillCircle(cx, cy, radius);
  maskShape.setVisible(false); // não precisa aparecer na tela

  // 2. Máscara invertida: mostra o overlay em tudo FORA do círculo
  const geoMask = maskShape.createGeometryMask();
  geoMask.setInvertAlpha(true);

  // 3. Retângulo vermelho cobrindo o mapa inteiro, com a máscara aplicada
  const overlay = scene.add.graphics();
  overlay.setDepth(999);
  overlay.fillStyle(0xff0000, alpha);
  overlay.fillRect(0, 0, MAP_W, MAP_H);
  overlay.setMask(geoMask);

  return {
    overlay,
    mask: maskShape,
    cx,        // ← adicione
    cy,        // ← adicione
    diameter,  // ← adicione
    inFog: false, // ← adicione
  };
};

/**
 * Atualiza a posição e tamanho do círculo.
 * Chame em update() para seguir o player.
 */
export const updateFogCircle = (
  fog:      FogCircle,
  cx:       number,
  cy:       number,
  diameter: number
): void => {
  const radius = diameter / 2;
  fog.mask.clear();
  fog.mask.fillStyle(0xffffff);
  fog.mask.fillCircle(cx, cy, radius);
};


/**
 * Chame em update() passando a posição do player.
 * Printa no console quando o player entra ou sai da névoa.
 */
export const checkFogCollision = (
  fog:     FogCircle,
  playerX: number,
  playerY: number
): void => {
  const radius = fog.diameter / 2;
  const dx     = playerX - fog.cx;
  const dy     = playerY - fog.cy;
  const dist   = Math.sqrt(dx * dx + dy * dy);
 
  const isOutside = dist > radius;
 
  if (isOutside && !fog.inFog) {
    fog.inFog = true;
    console.log(`⚠️  AVISO: player entrou na névoa! (dist: ${dist.toFixed(0)}px, raio: ${radius}px)`);
  }
 
  if (!isOutside && fog.inFog) {
    fog.inFog = false;
    console.log(`✅  Player voltou para a área segura.`);
  }
};

/**
 * Remove a névoa da cena completamente.
 */
export const destroyFogCircle = (fog: FogCircle): void => {
  fog.overlay.destroy();
  fog.mask.destroy();
};
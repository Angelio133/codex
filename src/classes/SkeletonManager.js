
import { SkeletonData } from "./SkeletonData";

export class SkeletonManager {

  // Les 16 articulations suivies
  static POINTS = [
    "nose",
    "left_ear",
    "right_ear",
    "neck",

    "left_shoulder",
    "right_shoulder",

    "left_elbow",
    "right_elbow",

    "left_wrist",
    "right_wrist",

    "left_hip",
    "right_hip",

    "left_knee",
    "right_knee",

    "left_ankle",
    "right_ankle"
  ];

  constructor(historyLimit = 120) {

    this.skeletons = {};

    SkeletonManager.POINTS.forEach(name => {
      this.skeletons[name] = new SkeletonData(name);
    });

    this.lastUpdate = null;
    this.frameCount = 0;

    this.history = [];
    this.historyLimit = historyLimit;

    console.log(
      "SkeletonManager initialisé :",
      this.getPointCount(),
      "articulations"
    );
  }

  // Mise à jour d'un seul point
  updatePoint(name, x, y, confidence = 1, timestamp = Date.now()) {

    const skeleton = this.skeletons[name];

    if (!skeleton) {
      console.warn("Articulation inconnue :", name);
      return false;
    }

    const updated = skeleton.update(
      x,
      y,
      confidence,
      timestamp
    );

    if (updated) {
      this.lastUpdate = timestamp;
    }

    return updated;
  }

  // Mise à jour d'une image complète
  updateFrame(results, timestamp = Date.now()) {

    if (!Array.isArray(results)) {
      console.warn("SkeletonManager : résultats invalides.");
      return this.getAll();
    }

    // Les anciens points restent mémorisés,
    // mais sont marqués invisibles jusqu'à leur nouvelle détection.
    Object.values(this.skeletons).forEach(skeleton => {
      skeleton.visible = false;
      skeleton.confidence = 0;
    });

    // Actualisation des points détectés
    results.forEach(point => {

      if (!point || !this.skeletons[point.name]) {
        return;
      }

      this.updatePoint(
        point.name,
        point.x,
        point.y,
        point.confidence ?? 1,
        timestamp
      );

    });

    this.lastUpdate = timestamp;
    this.frameCount++;

    const frame = this.getAll();

    // Conservation de l'historique
    this.history.push(frame);

    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    return frame;
  }

  // Compatibilité avec les anciens appels
  update(results, timestamp = Date.now()) {
    return this.updateFrame(results, timestamp);
  }

  // Récupération d'une articulation
  get(name) {
    return this.skeletons[name]?.getData() ?? null;
  }

  getPoint(name) {
    return this.get(name);
  }

  // Récupération X
  getX(name) {
    return this.skeletons[name]?.x ?? null;
  }

  // Récupération Y
  getY(name) {
    return this.skeletons[name]?.y ?? null;
  }

  // Vérification de visibilité
  isVisible(name) {
    return this.skeletons[name]?.visible ?? false;
  }

  // Récupération de toutes les articulations
  getAll() {

    const points = {};

    Object.entries(this.skeletons).forEach(([name, skeleton]) => {
      points[name] = skeleton.getData();
    });

    return {
      timestamp: this.lastUpdate,
      frameCount: this.frameCount,
      points
    };
  }

  // Dernier instantané
  getHistorySnapshot() {
    return this.getAll();
  }

  // Historique complet
  getHistory() {
    return this.history.map(frame => ({
      ...frame,
      points: Object.fromEntries(
        Object.entries(frame.points).map(([name, point]) => [
          name,
          { ...point }
        ])
      )
    }));
  }

  // Réinitialisation
  reset() {

    Object.values(this.skeletons).forEach(skeleton => {
      skeleton.x = null;
      skeleton.y = null;
      skeleton.confidence = 0;
      skeleton.timestamp = null;
      skeleton.visible = false;
    });

    this.lastUpdate = null;
    this.frameCount = 0;
    this.history = [];

    console.log("SkeletonManager : données réinitialisées.");
  }

  // Nombre de points disponibles
  getPointCount() {
    return Object.keys(this.skeletons).length;
  }
}

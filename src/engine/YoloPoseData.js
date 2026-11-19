
export class YoloPoseData {

  static POINT_NAMES = [
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
    this.latest = null;
    this.history = [];
    this.historyLimit = historyLimit;
    this.sequence = 0;
  }

  // Reçoit les points nommés de YOLO
  update(results, timestamp = Date.now()) {

    if (!Array.isArray(results)) {
      throw new Error("Les résultats YOLO doivent être un tableau.");
    }

    const points = {};

    for (const name of YoloPoseData.POINT_NAMES) {

      const point = results.find(item => item.name === name);

      if (!point) {
        points[name] = null;
        continue;
      }

      const x = Number(point.x);
      const y = Number(point.y);
      const confidence = Number(point.confidence ?? 1);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        points[name] = null;
        continue;
      }

      points[name] = {
        x,
        y,
        confidence,
        visible: confidence > 0
      };
    }

    const frame = {
      sequence: ++this.sequence,
      timestamp,
      points
    };

    // Dernière détection disponible
    this.latest = frame;

    // Historique borné
    this.history.push(frame);

    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    return this.getLatest();
  }

  getLatest() {
    return this.latest
      ? structuredClone(this.latest)
      : null;
  }

  getPoint(name) {
    const point = this.latest?.points[name];
    return point ? { ...point } : null;
  }

  getX(name) {
    return this.latest?.points[name]?.x ?? null;
  }

  getY(name) {
    return this.latest?.points[name]?.y ?? null;
  }

  getHistory() {
    return structuredClone(this.history);
  }

  clear() {
    this.latest = null;
    this.history = [];
    this.sequence = 0;
  }
}

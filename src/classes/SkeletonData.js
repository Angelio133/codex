
export class SkeletonData {
  constructor(name) {
    this.name = name;
    this.x = null;
    this.y = null;
    this.confidence = 0;
    this.timestamp = null;
    this.visible = false;
  }

  update(x, y, confidence = 1, timestamp = Date.now()) {
    if (!Number.isFinite(Number(x)) ||
        !Number.isFinite(Number(y))) {
      return false;
    }

    this.x = Number(x);
    this.y = Number(y);
    this.confidence = Number(confidence);
    this.timestamp = timestamp;
    this.visible = this.confidence > 0;

    return true;
  }

  getData() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      confidence: this.confidence,
      timestamp: this.timestamp,
      visible: this.visible
    };
  }
}


export class PoseCalculator {

  constructor(minConfidence = 0.35) {
    this.minConfidence = minConfidence;
  }

  // ==========================================
  // 1. RECUPERATION DES POINTS
  // ==========================================

  getPoint(points, name) {
    const point = points?.[name];

    if (
      !point ||
      point.visible === false ||
      point.confidence < this.minConfidence ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
      return null;
    }

    return point;
  }

  // ==========================================
  // 2. ANGLE ENTRE TROIS POINTS
  // ==========================================

  calculateJointAngle(a, b, c) {
    if (!a || !b || !c) return null;

    const v1 = {
      x: a.x - b.x,
      y: a.y - b.y
    };

    const v2 = {
      x: c.x - b.x,
      y: c.y - b.y
    };

    const dot = v1.x * v2.x + v1.y * v2.y;

    const norm1 = Math.hypot(v1.x, v1.y);
    const norm2 = Math.hypot(v2.x, v2.y);

    if (norm1 < 0.001 || norm2 < 0.001) return null;

    const cosine = Math.max(
      -1,
      Math.min(1, dot / (norm1 * norm2))
    );

    return Math.acos(cosine) * 180 / Math.PI;
  }

  // ==========================================
  // 3. ORIENTATION D'UN SEGMENT
  // ==========================================

  calculateSegmentAngle(a, b) {
    if (!a || !b) return null;

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.hypot(dx, dy) < 0.001) return null;

    return Math.atan2(dx, -dy) * 180 / Math.PI;
  }

  // ==========================================
  // 4. MILIEU ENTRE DEUX POINTS
  // ==========================================

  midpoint(a, b) {
    if (!a || !b) return null;

    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
  }

  // ==========================================
  // 5. CALCUL DE LA POSTURE COMPLETE
  // ==========================================

  calculate(frame) {
    if (!frame?.points) return null;

    const p = {};

    for (const name of Object.keys(frame.points)) {
      p[name] = this.getPoint(frame.points, name);
    }

    // Centres corporels
    const shoulderCenter = this.midpoint(
      p.left_shoulder,
      p.right_shoulder
    );

    const hipCenter = this.midpoint(
      p.left_hip,
      p.right_hip
    );

    const earCenter = this.midpoint(
      p.left_ear,
      p.right_ear
    );

    // Angles des coudes
    const elbowLeft = this.calculateJointAngle(
      p.left_shoulder,
      p.left_elbow,
      p.left_wrist
    );

    const elbowRight = this.calculateJointAngle(
      p.right_shoulder,
      p.right_elbow,
      p.right_wrist
    );

    // Angles des genoux
    const kneeLeft = this.calculateJointAngle(
      p.left_hip,
      p.left_knee,
      p.left_ankle
    );

    const kneeRight = this.calculateJointAngle(
      p.right_hip,
      p.right_knee,
      p.right_ankle
    );

    // Angles des épaules
    const leftShoulderAngle = this.calculateSegmentAngle(
      p.left_shoulder,
      p.left_elbow
    );

    const rightShoulderAngle = this.calculateSegmentAngle(
      p.right_shoulder,
      p.right_elbow
    );

    // Orientation des avant-bras
    const leftForearmAngle = this.calculateSegmentAngle(
      p.left_elbow,
      p.left_wrist
    );

    const rightForearmAngle = this.calculateSegmentAngle(
      p.right_elbow,
      p.right_wrist
    );

    // Orientation des cuisses
    const leftHipAngle = this.calculateSegmentAngle(
      p.left_hip,
      p.left_knee
    );

    const rightHipAngle = this.calculateSegmentAngle(
      p.right_hip,
      p.right_knee
    );

    // Orientation des pieds
    const leftAnkleAngle = this.calculateSegmentAngle(
      p.left_knee,
      p.left_ankle
    );

    const rightAnkleAngle = this.calculateSegmentAngle(
      p.right_knee,
      p.right_ankle
    );

    // Inclinaison du torse
    const torsoAngle = this.calculateSegmentAngle(
      hipCenter,
      shoulderCenter
    );

    // ==========================================
    // 6. TETE ET COU
    // ==========================================

    // Inclinaison de la ligne des oreilles
    const headTilt = this.calculateSegmentAngle(
      p.left_ear,
      p.right_ear
    );

    // Déplacement horizontal du nez par rapport
    // au centre des oreilles.
    let headYaw = null;

    if (
      p.nose &&
      p.left_ear &&
      p.right_ear
    ) {
      const earWidth = Math.abs(
        p.right_ear.x - p.left_ear.x
      );

      if (earWidth > 0.001) {
        headYaw =
          ((p.nose.x - earCenter.x) / earWidth) * 90;
      }
    }

    // Inclinaison du cou
    const neckAngle = this.calculateSegmentAngle(
      p.neck,
      earCenter || p.nose
    );

    // Inclinaison latérale de la tête
    const headSideTilt =
      shoulderCenter && earCenter
        ? this.calculateSegmentAngle(
            shoulderCenter,
            earCenter
          )
        : null;

    // ==========================================
    // 7. RESULTATS
    // ==========================================

    return {

      timestamp: frame.timestamp,
      sequence: frame.frameCount ?? frame.sequence,

      elbows: {
        left: elbowLeft === null ? null : 180 - elbowLeft,
        right: elbowRight === null ? null : 180 - elbowRight
      },

      knees: {
        left: kneeLeft === null ? null : 180 - kneeLeft,
        right: kneeRight === null ? null : 180 - kneeRight
      },

      shoulders: {
        left: leftShoulderAngle,
        right: rightShoulderAngle
      },

      forearms: {
        left: leftForearmAngle,
        right: rightForearmAngle
      },

      hips: {
        left: leftHipAngle,
        right: rightHipAngle
      },

      ankles: {
        left: leftAnkleAngle,
        right: rightAnkleAngle
      },

      torso: {
        angle: torsoAngle
      },

      neck: {
        angle: neckAngle
      },

      head: {
        tilt: headTilt,
        yaw: headYaw,
        sideTilt: headSideTilt
      }

    };
  }
}

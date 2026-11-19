
export class SkeletonMapper {

  constructor() {

    this.boneNames = {

      leftShoulder: "upperarm_l",
      rightShoulder: "upperarm_r",

      leftElbow: "lowerarm_l",
      rightElbow: "lowerarm_r",

      leftWrist: "hand_l",
      rightWrist: "hand_r",

      leftHip: "thigh_l",
      rightHip: "thigh_r",

      leftKnee: "calf_l",
      rightKnee: "calf_r",

      leftAnkle: "foot_l",
      rightAnkle: "foot_r",

      spine: "spine_01",
      chest: "spine_03",
      neck: "neck_01",
      head: "head"

    };

    // Axes provisoires à calibrer sur le modèle
    this.axisConfig = {
      leftShoulder: { axis: "z", sign: -1 },
      rightShoulder: { axis: "z", sign: 1 },

      leftElbow: { axis: "z", sign: 1 },
      rightElbow: { axis: "z", sign: -1 },

      leftHip: { axis: "z", sign: 1 },
      rightHip: { axis: "z", sign: -1 },

      leftKnee: { axis: "z", sign: -1 },
      rightKnee: { axis: "z", sign: 1 },

      torso: { axis: "x", sign: 1 }
    };
  }

  getBoneName(joint) {
    return this.boneNames[joint] ?? null;
  }

  getAxis(joint) {
    return this.axisConfig[joint] ?? null;
  }

  // Convertit les mesures en commandes de rotation
  mapPose(pose) {

    if (!pose) return {};

    return {

      leftShoulder: pose.shoulders.left,
      rightShoulder: pose.shoulders.right,

      leftElbow: pose.elbows.left,
      rightElbow: pose.elbows.right,

      leftHip: null,
      rightHip: null,

      leftKnee: pose.knees.left,
      rightKnee: pose.knees.right,

      torso: pose.torso.angle

    };
  }
}

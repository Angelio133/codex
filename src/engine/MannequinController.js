
import * as THREE from "three";

export class MannequinController {

  constructor(scene, mapper) {

    this.scene = scene;
    this.mapper = mapper;

    this.bones = new Map();
    this.initialRotations = new Map();

    this.smoothing = 12;

    this.currentTargets = {};

    this.initialize();
  }

  initialize() {

    this.scene.traverse(object => {

      if (object.isBone) {

        this.bones.set(object.name, object);

        this.initialRotations.set(object.name, {
          x: object.rotation.x,
          y: object.rotation.y,
          z: object.rotation.z
        });

      }

    });

    console.log(
      "MannequinController :",
      this.bones.size,
      "os récupérés"
    );

  }

  getBone(joint) {

    const boneName = this.mapper.getBoneName(joint);

    return boneName ? this.bones.get(boneName) ?? null : null;
  }

  setPose(commands) {
    this.currentTargets = { ...commands };
  }

  update(delta) {

    const degreesToRadians = THREE.MathUtils.degToRad;

    Object.entries(this.mapper.axisConfig).forEach(
      ([joint, config]) => {

        const angle = this.currentTargets[joint];

        if (angle === null || angle === undefined) return;

        const bone = this.getBone(joint);

        if (!bone) return;

        const original = this.initialRotations.get(bone.name);

        if (!original) return;

        const target =
          original[config.axis] +
          degreesToRadians(angle * config.sign);

        bone.rotation[config.axis] = THREE.MathUtils.damp(
          bone.rotation[config.axis],
          target,
          this.smoothing,
          delta
        );

      }
    );

  }

  reset() {

    this.initialRotations.forEach((rotation, name) => {

      const bone = this.bones.get(name);

      if (!bone) return;

      bone.rotation.set(
        rotation.x,
        rotation.y,
        rotation.z
      );

    });

    this.currentTargets = {};
  }

  getBoneCount() {
    return this.bones.size;
  }
}

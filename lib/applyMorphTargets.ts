import * as THREE from 'three';
import { MeasureField } from '@/types/avatar';

export const MORPH_TARGET_NAMES: Record<MeasureField, { incr: string; decr: string }> = {
  chest: {
    incr: 'measure-bust-circ-incr',
    decr: 'measure-bust-circ-decr',
  },
  waist: {
    incr: 'measure-waist-circ-incr',
    decr: 'measure-waist-circ-decr',
  },
  hip: {
    incr: 'measure-hips-circ-incr',
    decr: 'measure-hips-circ-decr',
  },
  shoulder: {
    incr: 'measure-shoulder-dist-incr',
    decr: 'measure-shoulder-dist-decr',
  },
};

export interface MorphParams {
  morphDeltasCm?: Partial<Record<MeasureField, number>> | null;
  morphFactors?: Partial<Record<MeasureField, number>> | null;
}

/**
 * Traverses a 3D object / scene and applies morph target influences based on
 * measurements delta (cm) and calibrated factors (cm / morph unit).
 * Clamps influence to [-1, 1] range and applies to incr/decr channels.
 */
export function applyMorphTargets(
  object: THREE.Object3D,
  params?: MorphParams | null
): void {
  if (!object || !params) return;
  const { morphDeltasCm, morphFactors } = params;
  if (!morphDeltasCm || !morphFactors) return;

  const fields: MeasureField[] = ['chest', 'waist', 'hip', 'shoulder'];

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
      return;
    }

    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    for (const field of fields) {
      const delta = morphDeltasCm[field] ?? 0;
      const factor = morphFactors[field] ?? 1;

      if (!factor || isNaN(factor) || isNaN(delta)) continue;

      const influence = Math.max(-1, Math.min(1, delta / factor));
      const targetNames = MORPH_TARGET_NAMES[field];

      const incrIndex = dict[targetNames.incr];
      const decrIndex = dict[targetNames.decr];

      if (incrIndex !== undefined) {
        influences[incrIndex] = influence > 0 ? influence : 0;
      }
      if (decrIndex !== undefined) {
        influences[decrIndex] = influence < 0 ? Math.abs(influence) : 0;
      }
    }
  });
}

import { Node } from '@gltf-transform/core'
import { Quaternion } from '../core/Quaternion'
import { Object3D } from './Object3D'

export class Group extends Object3D {
  constructor(node: Node) {
    super()

    this.name = node.getName()
    const quat = new Quaternion(...node.getRotation())
    this.setTRS(node.getTranslation(), quat.getEuler('XYZ'), node.getScale())
  }
}

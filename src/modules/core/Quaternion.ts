type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'

export class Quaternion {
  constructor(
    private x: number,
    private y: number,
    private z: number,
    private w: number,
  ) {}

  getEuler(order: EulerOrder): [number, number, number] {
    const [qx, qy, qz, qw] = [this.x, this.y, this.z, this.w]

    const x2 = qx + qx
    const y2 = qy + qy
    const z2 = qz + qz

    const xx = qx * x2
    const xy = qx * y2
    const xz = qx * z2
    const yy = qy * y2
    const yz = qy * z2
    const zz = qz * z2
    const wx = qw * x2
    const wy = qw * y2
    const wz = qw * z2

    // prettier-ignore
    const R = [
      [1 - (yy + zz),       xy - wz,       xz + wy],
      [      xy + wz, 1 - (xx + zz),       yz - wx],
      [      xz - wy,       yz + wx, 1 - (xx + yy)],
    ]

    const clamp = (v: number) => Math.max(-1, Math.min(1, v))

    let x = 0
    let y = 0
    let z = 0

    const eps = 0.9999999

    switch (order) {
      case 'XYZ':
        y = Math.asin(clamp(R[0][2]))

        if (Math.abs(R[0][2]) < eps) {
          x = Math.atan2(-R[1][2], R[2][2])
          z = Math.atan2(-R[0][1], R[0][0])
        } else {
          x = Math.atan2(R[2][1], R[1][1])
        }
        break

      case 'XZY':
        z = Math.asin(-clamp(R[0][1]))

        if (Math.abs(R[0][1]) < eps) {
          x = Math.atan2(R[2][1], R[1][1])
          y = Math.atan2(R[0][2], R[0][0])
        } else {
          x = Math.atan2(-R[1][2], R[2][2])
        }
        break

      case 'YXZ':
        x = Math.asin(-clamp(R[1][2]))

        if (Math.abs(R[1][2]) < eps) {
          y = Math.atan2(R[0][2], R[2][2])
          z = Math.atan2(R[1][0], R[1][1])
        } else {
          y = Math.atan2(-R[2][0], R[0][0])
        }
        break

      case 'YZX':
        z = Math.asin(clamp(R[1][0]))

        if (Math.abs(R[1][0]) < eps) {
          x = Math.atan2(-R[1][2], R[1][1])
          y = Math.atan2(-R[2][0], R[0][0])
        } else {
          y = Math.atan2(R[0][2], R[2][2])
        }
        break

      case 'ZXY':
        x = Math.asin(clamp(R[2][1]))

        if (Math.abs(R[2][1]) < eps) {
          y = Math.atan2(-R[2][0], R[2][2])
          z = Math.atan2(-R[0][1], R[1][1])
        } else {
          z = Math.atan2(R[1][0], R[0][0])
        }
        break

      case 'ZYX':
        y = Math.asin(-clamp(R[2][0]))

        if (Math.abs(R[2][0]) < eps) {
          x = Math.atan2(R[2][1], R[2][2])
          z = Math.atan2(R[1][0], R[0][0])
        } else {
          z = Math.atan2(-R[0][1], R[1][1])
        }
        break
    }

    return [x, y, z]
  }
}

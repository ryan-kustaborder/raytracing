export default class Point3D {
    constructor(a, b, c) {
        this.vector = [a, b, c];
    }

    x() {
        return this.vector[0];
    }

    y() {
        return this.vector[1];
    }

    z() {
        return this.vector[2];
    }

    negate() {
        return new Point3D(this.x() * -1, this.y() * -1, this.z * -1);
    }

    addVector(v) {
        return new Point3D(
            this.x() + v.x(),
            this.y() + v.y(),
            this.z() + v.z()
        );
    }

    subtractVector(v) {
        return new Point3D(
            this.x() - v.x(),
            this.y() - v.y(),
            this.z() - v.z()
        );
    }

    multiplyVector(v) {
        return new Point3D(
            this.x() * v.x(),
            this.y() * v.y(),
            this.z() * v.z()
        );
    }

    scale(s) {
        return new Point3D(this.x() * s, this.y() * s, this.z() * s);
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.x() * this.x() + this.y() * this.y() + this.z() * this.z();
    }
}

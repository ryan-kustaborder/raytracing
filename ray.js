export default class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    // Calcultes P(t) = A + tb where A is the ray origin an b is the ray direction
    at(t) {
        return this.origin.addVector(this.direction.scale(t));
    }
}

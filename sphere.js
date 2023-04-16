import Point3D from "./Point3D.js";
import { dot } from "./util.js";
import LambertianMaterial from "./Materials.js";

// Generic class for all hittable objects
class Hittable {
    constructor() {
        this.material = new LambertianMaterial();
    }
    hit(r, tMin, tMax, rec) {
        return;
    }
}

// Records the normal for the hit
export class HitRecord {
    constructor() {
        this.point = null;
        this.normal = null;
        this.t = null;
        this.frontFace = null;
    }

    setFaceNormal(r, outwardNormal) {
        this.frontFace = dot(r.direction, outwardNormal) < 0;
        this.normal = this.frontFace ? outwardNormal : outwardNormal.negate();
    }
}

// Generic list of hittable objects
export class HittableList extends Hittable {
    constructor() {
        super();

        this.hittables = [];
        this.material = new LambertianMaterial();
    }

    add(e) {
        this.hittables.push(e);
    }

    clear() {
        this.hittables = [];
    }

    hit(r, tMin, tMax, rec) {
        let tempRec = new HitRecord();
        let hitAnything = false;
        let closestSoFar = tMax;

        // Run the hit calculations for every object in the scene
        for (let object of this.hittables) {
            let result = object.hit(r, tMin, closestSoFar, tempRec);
            if (result.hit) {
                hitAnything = true;

                // Need to keep track which object is hit first
                closestSoFar = result.record.t;
                rec = result.record;
            }
        }

        return { hit: hitAnything, record: rec };
    }
}

// Represents a simple sphere
export default class Sphere extends Hittable {
    constructor(center, radius, material) {
        super();

        this.center = center;
        this.radius = radius;

        this.material = material;
    }

    hit(r, tMin, tMax, rec) {
        let oc = r.origin.subtractVector(this.center);
        let a = r.direction.lengthSquared();
        let halfB = dot(oc, r.direction);
        let c = oc.lengthSquared() - this.radius * this.radius;

        // Check if ray hits sphere
        let discriminant = halfB * halfB - a * c;
        if (discriminant < 0) {
            return { hit: false, record: rec };
        }
        let sqrtd = Math.sqrt(discriminant);

        // Find the nearest root that lies in the acceptable range.
        let root = (-halfB - sqrtd) / a;
        if (root < tMin || tMax < root) {
            root = (-halfB + sqrtd) / a;
            if (root < tMin || tMax < root) return { hit: false, record: rec };
        }

        // If there is a hit, we need to calculate the surface normal
        rec.t = root;
        rec.point = r.at(rec.t);
        let outwardNormal = rec.point
            .subtractVector(this.center)
            .scale(1 / this.radius);
        rec.setFaceNormal(r, outwardNormal);
        rec.material = this.material;

        return { hit: true, record: rec };
    }
}

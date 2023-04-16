import {
    isNearZero,
    randomUnitVector,
    reflect,
    unitVector,
    dot,
    randomDirectionInUnitSphere,
} from "./util.js";
import vec3 from "./vec3.js";
import ray from "./ray.js";

export default class material {
    constructor(color, diffuseStrength) {
        this.materialColor = new vec3(
            Math.random(),
            Math.random(),
            Math.random()
        );
        this.diffuseStrength = Math.random();

        this.emissionColor = new vec3(0.2, 0.5, 0);
        this.emissionStrength = Math.random();

        this.isLambertian = true;
    }

    scatter(rIn, rec) {
        // We can ignore this if material is nonreflective
        if (!this.isLambertian) {
            return { didScatter: false };
        }

        let scatter_direction = rec.normal.addVector(randomUnitVector());

        if (isNearZero(scatter_direction)) {
            scatter_direction = rec.normal;
        }

        return {
            didScatter: true,
            scattered: new ray(rec.point, scatter_direction),
            attenuation: rec.material.materialColor,
        };
    }
}

export class metal extends material {
    constructor(color, diffuseStrength) {
        super(color, diffuseStrength);

        this.fuzziness = Math.random();
    }

    scatter(rIn, rec) {
        let reflected = reflect(unitVector(rIn.direction), rec.normal);

        let scattered = new ray(
            rec.point,
            reflected.addVector(
                randomDirectionInUnitSphere().scale(this.fuzziness)
            )
        );

        return {
            didScatter: dot(scattered.direction, rec.normal) > 0,
            scattered: scattered,
            attenuation: this.materialColor,
        };
    }
}

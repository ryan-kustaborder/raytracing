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
    constructor(color) {
        if (color != null) {
            this.materialColor = color;
        } else {
            this.materialColor = new vec3(
                Math.random(),
                Math.random(),
                Math.random()
            );
        }

        // These currently do nothing, but are placeholders for future light implementation
        this.emissionColor = new vec3(0.2, 0.5, 0);
        this.emissionStrength = Math.random();
    }

    // Gets the light that is added from interacting with the material
    scatter(rIn, rec) {
        // Pick a random direction
        let scatter_direction = rec.normal.addVector(randomUnitVector());

        // If it is close to 0, we can save computation by just using the normal
        if (isNearZero(scatter_direction)) {
            scatter_direction = rec.normal;
        }

        return {
            didScatter: true,
            scattered: new ray(rec.point, scatter_direction), // Ray from hit point in direction of scatter
            attenuation: rec.material.materialColor, // Add the material's color to the ray
        };
    }
}

export class metal extends material {
    constructor(color, roughness) {
        super(color);

        if (roughness != null) {
            this.roughness = roughness;
        } else {
            this.roughness = 0.05;
        }
    }

    // Gets the light that is added from interacting with the material
    scatter(rIn, rec) {
        // Reflect the incoming ray
        let reflected = reflect(unitVector(rIn.direction), rec.normal);

        // Find path of scattered ray
        let scattered = new ray(
            rec.point,
            reflected.addVector(
                randomDirectionInUnitSphere().scale(this.roughness) // Roughness adds random perturbations, producing "fuzzier" reflections
            )
        );

        return {
            didScatter: dot(scattered.direction, rec.normal) > 0,
            scattered: scattered,
            attenuation: this.materialColor,
        };
    }
}

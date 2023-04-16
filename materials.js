import {
    isNearZero,
    randomUnitVector,
    reflect,
    unitVector,
    dot,
    randomDirectionInUnitSphere,
} from "./util.js";
import Point3D from "./Point3D.js";
import Ray from "./Ray.js";

export default class LambertianMaterial {
    constructor(color) {
        if (color != null) {
            this.materialColor = color;
        } else {
            this.materialColor = new Point3D(
                Math.random(),
                Math.random(),
                Math.random()
            );
        }

        // These currently do nothing, but are placeholders for future light implementation
        this.emissionColor = new Point3D(0.2, 0.5, 0);
        this.emissionStrength = Math.random();
    }

    // Gets the light that is added from interacting with the material
    scatter(rIn, rec) {
        // Pick a random direction
        let scatterDirection = rec.normal.addVector(randomUnitVector());

        // If it is close to 0, we can save computation by just using the normal
        if (isNearZero(scatterDirection)) {
            scatterDirection = rec.normal;
        }

        return {
            didScatter: true,
            scattered: new Ray(rec.point, scatterDirection), // Ray from hit point in direction of scatter
            attenuation: rec.material.materialColor, // Add the material's color to the ray
        };
    }
}

export class ReflectiveLambertianMaterial extends LambertianMaterial {
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
        let scattered = new Ray(
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

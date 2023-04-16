import vec3 from "./vec3.js";
import ray from "./ray.js";
import { unitVector, clamp, randomUnitVector } from "./util.js";
import { HitRecord } from "./sphere.js";

const INFINITY = Number.MAX_SAFE_INTEGER;

// Calculates color added for a single ray for a normal map texture
function normalMapRayColor(r, world) {
    let rec = new HitRecord();

    // Cast the ray
    let result = world.hit(r, 0, INFINITY, rec);
    if (result.hit) {
        // Return the normal vector from the hit
        return result.record.normal.addVector(new vec3(1, 1, 1)).scale(0.5);
    }

    // If no hit, color is based on background gradient
    let unitDirection = unitVector(r.direction);
    let t = 0.5 * (unitDirection.y() + 1.0);
    return new vec3(1.0, 1.0, 1.0)
        .scale(1.0 - t)
        .addVector(new vec3(0.5, 0.7, 1.0).scale(t));
}

// Calculates color added for a single ray
export function rayColor(r, world, depth) {
    if (depth <= 0) {
        return new vec3(0, 0, 0);
    }

    let rec = new HitRecord();

    // Cast the ray
    let result = world.hit(r, 0.001, INFINITY, rec); // Use .001 instead of 0 to address shadow acne
    if (result.hit) {
        let resRec = result.record;

        // Generate random direction from hit point
        let target = resRec.point
            .addVector(resRec.normal)
            .addVector(randomUnitVector());

        // Create a new ray from hit point
        let newRay = new ray(
            result.record.point,
            target.subtractVector(resRec.point)
        );

        // Get the color from the new ray
        let nextColor = rayColor(newRay, world, depth - 1);

        // Add color from this hit
        let emittedLight = resRec.material.emissionColor.scale(
            resRec.material.emissionStrength
        );
        nextColor = nextColor.multiplyVector(resRec.material.materialColor);
        nextColor = nextColor.scale(resRec.material.diffuseStrength);

        // Return the ray color
        return nextColor;
    }

    // If no hit, color is based on background gradient
    let unitDirection = unitVector(r.direction);
    let t = 0.5 * (unitDirection.y() + 1.0);
    return new vec3(1.0, 1.0, 1.0)
        .scale(1.0 - t)
        .addVector(new vec3(0.5, 0.7, 1.0).scale(t));
}

// Averages the colors from multiple samples for the same pixel
export function averageColor(color, samples) {
    const scale = 1.0 / samples;

    // Gamma Correction
    let r = Math.sqrt(color.x() * scale);
    let g = Math.sqrt(color.y() * scale);
    let b = Math.sqrt(color.z() * scale);

    r = clamp(r, 0.0, 0.999);
    g = clamp(g, 0.0, 0.999);
    b = clamp(b, 0.0, 0.999);

    return new vec3(r, g, b);
}

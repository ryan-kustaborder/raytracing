import Point3D from "./Point3D.js";
import Ray from "./Ray.js";
import { unitVector, clamp, randomUnitVector } from "./util.js";
import { HitRecord } from "./Sphere.js";

const INFINITY = Number.MAX_SAFE_INTEGER;

// Calculates color added for a single ray for a normal map texture
function normalMapRayColor(r, world) {
    let rec = new HitRecord();

    // Cast the ray
    let result = world.hit(r, 0, INFINITY, rec);
    if (result.hit) {
        // Return the normal vector from the hit
        return result.record.normal.addVector(new Point3D(1, 1, 1)).scale(0.5);
    }

    // If no hit, color is based on background gradient
    let unitDirection = unitVector(r.direction);
    let t = 0.5 * (unitDirection.y() + 1.0);
    return new Point3D(1.0, 1.0, 1.0)
        .scale(1.0 - t)
        .addVector(new Point3D(0.5, 0.7, 1.0).scale(t));
}

// Calculates color added for a single ray
export function rayColor(r, world, depth) {
    if (depth <= 0) {
        return new Point3D(0, 0, 0);
    }

    let rec = new HitRecord();

    // Cast the ray
    let result = world.hit(r, 0.001, INFINITY, rec); // Use .001 instead of 0 to address shadow acne
    if (result.hit) {
        let resRec = result.record;

        let scatterResponse = resRec.material.scatter(r, resRec);
        if (scatterResponse.didScatter) {
            return scatterResponse.attenuation.multiplyVector(
                rayColor(scatterResponse.scattered, world, depth - 1)
            );
        } else {
            return new Point3D(0, 0, 0);
        }
    }

    // If no hit, color is based on background gradient
    let unitDirection = unitVector(r.direction);
    let t = 0.5 * (unitDirection.y() + 1.0);
    return new Point3D(1.0, 1.0, 1.0)
        .scale(1.0 - t)
        .addVector(new Point3D(0.5, 0.7, 1.0).scale(t));
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

    return new Point3D(r, g, b);
}

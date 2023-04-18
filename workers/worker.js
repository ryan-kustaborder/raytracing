self.onmessage = function (msg) {
    const world = new World();
    let material_ground = new LambertianMaterial();
    let material_center = new LambertianMaterial();
    let material_left = new ReflectiveLambertianMaterial();
    material_left.materialColor = new Point3D(1, 0, 0);
    let material_right = new ReflectiveLambertianMaterial();
    material_right.materialColor = new Point3D(0, 0, 1);

    world.add(
        new Sphere(new Point3D(0.0, 100.5, -1.0), 100.0, material_ground)
    );
    world.add(new Sphere(new Point3D(0.0, 0.0, -1.0), 0.5, material_center));
    world.add(new Sphere(new Point3D(-1.0, 0.0, -1.0), 0.5, material_left));
    world.add(new Sphere(new Point3D(1.0, 0.0, -1.0), 0.5, material_right));

    const cam = msg.data.camera;
    const img = msg.data.image;
    const bounds = msg.data.bounds;

    self.postMessage(
        world.renderSection(
            bounds.x0,
            bounds.y0,
            bounds.width,
            bounds.height,
            cam,
            img
        )
    );
};

// Gets the given ray from the camera origin that goes through the given screen pixel
function getRayFromCamera(u, v, cam) {
    let origin = new Point3D(...cam.origin.vector);
    let lowerLeftCorner = new Point3D(...cam.lowerLeftCorner.vector);
    let scaledHorizontal = new Point3D(...cam.horizontal.vector).scale(u);
    let scaledVertical = new Point3D(...cam.vertical.vector).scale(v);

    return new Ray(
        origin,
        lowerLeftCorner
            .addVector(scaledHorizontal)
            .addVector(scaledVertical)
            .subtractVector(origin)
    );
}

class Point3D {
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

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    // Calcultes P(t) = A + tb where A is the ray origin an b is the ray direction
    at(t) {
        return this.origin.addVector(this.direction.scale(t));
    }
}

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
class HitRecord {
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
class HittableList extends Hittable {
    constructor() {
        super();

        this.hittables = [];
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

class World extends HittableList {
    constructor() {
        super();
    }

    renderSection(x0, y0, w, h, cam, img) {
        // Define these as consts for slightly faster read times
        const imgWidth = img.imgWidth;
        const imgHeight = img.imgHeight;

        const maxDepth = img.maxDepth;
        const samplesPerPixel = img.samplesPerPixel;

        const totalPixels = w * h;
        const initialValue = [0, 0, 0, 1];
        const imgData = Array(totalPixels).fill(initialValue).flat();
        imgData[0] = 0.4;

        let i = 0;

        for (let y = y0; y < y0 + h; y++) {
            for (let x = x0; x < x0 + w; x++) {
                let pixelColor = new Point3D(0, 0.5, 0);
                // Cast samplesPerPixel rays for each pixel
                for (let s = 0; s < img.samplesPerPixel; s++) {
                    let u = (x + Math.random()) / (imgWidth - 1);
                    let v = (y + Math.random()) / (imgHeight - 1);
                    let r = getRayFromCamera(u, v, cam);
                    // Cast the ray
                    let colorFromRay = rayColor(r, this, maxDepth);
                    // Add to cumulative color for this pixel
                    pixelColor = pixelColor.addVector(colorFromRay);
                }

                // Write the final pixel
                let color = averageColor(pixelColor, samplesPerPixel);

                imgData[i + 0] = map255(color.x());
                imgData[i + 1] = map255(color.y());
                imgData[i + 2] = map255(color.z());
                imgData[i + 3] = 255;

                i += 4;
            }
        }
        return imgData;
    }
}

// Represents a simple sphere
class Sphere extends Hittable {
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

// Represents the camera
class Camera {
    constructor() {
        this.aspectRatio = 16.0 / 9.0;
        this.viewportHeight = 2.0;
        this.viewportWidth = this.aspectRatio * this.viewportHeight;
        this.focalLength = 1;

        this.origin = new Point3D(0, 0, 0);
        this.horizontal = new Point3D(this.viewportWidth, 0, 0);
        this.vertical = new Point3D(0, this.viewportHeight, 0);
        this.lowerLeftCorner = this.origin
            .subtractVector(this.horizontal.scale(0.5))
            .subtractVector(this.vertical.scale(0.5))
            .subtractVector(new Point3D(0, 0, this.focalLength));
    }

    // Gets the given ray from the camera origin that goes through the given screen pixel
    getRay(u, v) {
        return new Ray(
            this.origin,
            this.lowerLeftCorner
                .addVector(this.horizontal.scale(u))
                .addVector(this.vertical.scale(v))
                .subtractVector(this.origin)
        );
    }
}

class LambertianMaterial {
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

class ReflectiveLambertianMaterial extends LambertianMaterial {
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

/**********************************************

                UTILITY FUNCTIONS

***********************************************/

function map(val, fromMin, fromMax, toMin, toMax) {
    return ((val - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}

function map255(val) {
    return map(val, 0, 1, 0, 255);
}

function dot(u, v) {
    return u.x() * v.x() + u.y() * v.y() + u.z() * v.z();
}

function unitVector(v) {
    return v.scale(1 / v.length());
}

function clamp(val, min, max) {
    if (val > max) {
        return max;
    } else if (val < min) {
        return min;
    }

    return val;
}

function randomDirection() {
    return new Point3D(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
    );
}

function randomDirectionInUnitSphere() {
    while (true) {
        let dir = randomDirection();
        if (dir.lengthSquared() >= 1) {
            continue;
        }
        return dir;
    }
}

function randomUnitVector() {
    return unitVector(randomDirectionInUnitSphere());
}

function isNearZero(v) {
    // Return true if the vector is close to zero in all dimensions.
    const s = 0.00000001;
    return Math.abs(v.x()) < s && Math.abs(v.y()) < s && Math.abs(v.z()) < s;
}

function reflect(v, n) {
    return v.subtractVector(n.scale(dot(v, n)).scale(2));
}

/**********************************************

                OTHER FUNCTIONS

***********************************************/

// Calculates color added for a single ray
function rayColor(r, world, depth) {
    if (depth <= 0) {
        return new Point3D(0, 0, 0);
    }

    let rec = new HitRecord();

    // Cast the ray
    let result = world.hit(r, 0.001, Number.MAX_SAFE_INTEGER, rec); // Use .001 instead of 0 to address shadow acne
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
function averageColor(color, samples) {
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

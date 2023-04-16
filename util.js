import vec3 from "./vec3.js";

export function map(val, fromMin, fromMax, toMin, toMax) {
    return ((val - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}

export function map255(val) {
    return map(val, 0, 1, 0, 255);
}

export function dot(u, v) {
    return u.x() * v.x() + u.y() * v.y() + u.z() * v.z();
}

export function writeToImageData(imgData, x, y, color, a = 255) {
    let i = imgData.data.length - (y * imgData.width + x) * 4;
    imgData.data[i + 0] = map255(color.x());
    imgData.data[i + 1] = map255(color.y());
    imgData.data[i + 2] = map255(color.z());
    imgData.data[i + 3] = a;
}

export function unitVector(v) {
    return v.scale(1 / v.length());
}

export function clamp(val, min, max) {
    if (val > max) {
        return max;
    } else if (val < min) {
        return min;
    }

    return val;
}

export function randomDirection() {
    return new vec3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
    );
}

export function randomDirectionInUnitSphere() {
    while (true) {
        let dir = randomDirection();
        if (dir.lengthSquared() >= 1) {
            continue;
        }
        return dir;
    }
}

export function randomUnitVector() {
    return unitVector(randomDirectionInUnitSphere());
}

export function isNearZero(v) {
    // Return true if the vector is close to zero in all dimensions.
    const s = 0.00000001;
    return Math.abs(v.x()) < s && Math.abs(v.y()) < s && Math.abs(v.z()) < s;
}

export function reflect(v, n) {
    return v.subtractVector(n.scale(dot(v, n)).scale(2));
}

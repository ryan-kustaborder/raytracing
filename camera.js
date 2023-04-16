import Ray from "./Ray.js";
import Point3D from "./Point3D.js";

export default class Camera {
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

import vec3 from "./vec3.js";

export default class material {
    constructor() {
        this.materialColor = new vec3(
            Math.random(),
            Math.random(),
            Math.random()
        );
        this.diffuseStrength = Math.random();

        this.emissionColor = new vec3(0.2, 0.5, 0);
        this.emissionStrength = Math.random();
    }

    scatter() {
        return 0;
    }
}

import Point3D from "./Point3D.js";
import Sphere from "./Sphere.js";
import Camera from "./Camera.js";
import World from "./World.js";
import Image from "./Image.js";
import LambertianMaterial, {
    ReflectiveLambertianMaterial,
} from "./Materials.js";

function singleSphere() {
    // Camera
    const camera = new Camera();

    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new Image(canvas);

    // World
    let wor = new World();
    wor.add(new Sphere(new Point3D(0, 0, -1), 0.5));
    wor.add(new Sphere(new Point3D(0, -100.5, -1), 100));

    let imgData = wor.render(camera, img);

    img.ctx.putImageData(imgData, 0, 0);
}

function metallicSpheres() {
    // Camera
    const camera = new Camera();

    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new Image(canvas);

    // World
    let wor = new World();

    let material_ground = new LambertianMaterial();
    let material_center = new LambertianMaterial();
    let material_left = new ReflectiveLambertianMaterial();
    let material_right = new ReflectiveLambertianMaterial();

    wor.add(new Sphere(new Point3D(0.0, -100.5, -1.0), 100.0, material_ground));
    wor.add(new Sphere(new Point3D(0.0, 0.0, -1.0), 0.5, material_center));
    wor.add(new Sphere(new Point3D(-1.0, 0.0, -1.0), 0.5, material_left));
    wor.add(new Sphere(new Point3D(1.0, 0.0, -1.0), 0.5, material_right));

    let imgData = wor.render(camera, img);

    img.ctx.putImageData(imgData, 0, 0);
}

//singleSphere();
metallicSpheres();

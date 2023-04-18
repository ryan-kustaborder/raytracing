import Point3D from "./Point3D.js";
import Sphere from "./Sphere.js";
import Camera from "./camera.js";
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

    // Set up worker
    let worker = new Worker("./workers/worker.js");
    let config = {
        world: wor,
        camera: camera,
        image: img,
    };

    worker.onmessage = function (msg) {
        const width = 400;
        const height = 225;
        const imageData = img.ctx.createImageData(width, height);
        const inputArray = msg.data;

        //Put data into ImageData object
        for (let i = 0; i < inputArray.length; i += 4) {
            const r = inputArray[i];
            const g = inputArray[i + 1];
            const b = inputArray[i + 2];
            const a = inputArray[i + 3];

            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = a;
        }

        // Draw the image to the canvas
        img.ctx.putImageData(imageData, 0, 0);
    };

    // Actually start the worker
    worker.postMessage(JSON.parse(JSON.stringify(config)));
}

function manySpheresWorld() {
    // World
    let world = new World();

    let ground_material = new LambertianMaterial(new Point3D(0.5, 0.5, 0.5));
    world.add(new Sphere(new Point3D(0, -1000, 0), 1000, ground_material));

    for (let a = -11; a < 11; a++) {
        for (let b = -11; b < 11; b++) {
            let choose_mat = Math.random();
            let center = new Point3D(
                a + 0.9 * Math.random(),
                0.2,
                b + 0.9 * Math.random()
            );

            if (center.subtractVector(new Point3D(4, 0.2, 0)).length() > 0.9) {
                let sphere_material;

                if (choose_mat < 0.8) {
                    // diffuse
                    let albedo = new Point3D(
                        Math.random(),
                        Math.random(),
                        Math.random()
                    ).multiplyVector(
                        new Point3D(Math.random(), Math.random(), Math.random())
                    );
                    sphere_material = new LambertianMaterial(albedo);
                    //world.add(new Sphere(center, 0.2, sphere_material));
                } else if (choose_mat < 0.95) {
                    // metal
                    let albedo = new Point3D(
                        1 - Math.random() / 2,
                        1 - Math.random() / 2,
                        1 - Math.random() / 2
                    );
                    let fuzz = Math.random() / 2;
                    sphere_material = new ReflectiveLambertianMaterial(
                        albedo,
                        fuzz
                    );
                    //world.add(new Sphere(center, 0.2, sphere_material));
                } else {
                    // metal
                    let albedo = new Point3D(
                        1 - Math.random() / 2,
                        1 - Math.random() / 2,
                        1 - Math.random() / 2
                    );
                    let fuzz = Math.random() / 2;
                    sphere_material = new ReflectiveLambertianMaterial(
                        albedo,
                        fuzz
                    );
                    //world.add(new Sphere(center, 0.2, sphere_material));
                }
            }
        }
    }

    let material1 = new ReflectiveLambertianMaterial(
        new Point3D(0.4, 0.8, 0.9),
        0.0
    );
    world.add(new Sphere(new Point3D(0, 1, 0), 1.0, material1));

    let material2 = new LambertianMaterial(new Point3D(0.4, 0.2, 0.1));
    world.add(new Sphere(new Point3D(-4, 1, 0), 1.0, material2));

    let material3 = new ReflectiveLambertianMaterial(
        new Point3D(0.7, 0.6, 0.5),
        0.0
    );
    world.add(new Sphere(new Point3D(4, 1, 0), 1.0, material3));

    return world;
}

function manySpheres() {
    // Camera
    const camera = new Camera();

    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new Image(canvas);

    // World
    let world = manySpheresWorld();

    let imgData = world.render(camera, img);

    img.ctx.putImageData(imgData, 0, 0);
}

//singleSphere();
metallicSpheres();
//manySpheres();

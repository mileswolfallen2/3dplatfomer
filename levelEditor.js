const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

const createEditorScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.9); // Sky color

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 4,
        50,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Load the 3D Model as the Level
    BABYLON.SceneLoader.ImportMesh(
        "", // Leave empty to load all meshes
        "./assets/", // Path to the model directory
        "level.glb", // Model file name
        scene,
        function (meshes) {
            // Adjust the position and scale of the imported model
            meshes.forEach((mesh) => {
                mesh.position = new BABYLON.Vector3(0, 0, 0); // Center the model
                mesh.scaling = new BABYLON.Vector3(1, 1, 1); // Adjust scale if needed
                mesh.checkCollisions = true; // Enable collisions for the model
            });
            console.log("Level model loaded successfully!");
        },
        null,
        function (scene, message, exception) {
            console.error("Error loading level model:", message, exception);
        }
    );

    // Create UI
    function createUI() {
        const uiContainer = document.createElement("div");
        uiContainer.style.position = "absolute";
        uiContainer.style.top = "10px";
        uiContainer.style.left = "10px";
        uiContainer.style.zIndex = "100";
        uiContainer.style.display = "flex";
        uiContainer.style.gap = "10px";
        document.body.appendChild(uiContainer);

        // Save Level Button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Level";
        saveButton.onclick = () => {
            console.log("Save functionality can be added here.");
        };
        uiContainer.appendChild(saveButton);
    }

    createUI();

    return scene;
};

const scene = createEditorScene();

window.addEventListener("resize", function () {
    engine.resize();
});
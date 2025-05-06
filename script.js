const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.9); // Sky color

    // Enable collisions in the scene
    scene.collisionsEnabled = true;

    // Player
    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 2 }, scene); // Simple box for the player
    player.position = new BABYLON.Vector3(0, 5, 0); // Start above the ground
    player.material = new BABYLON.StandardMaterial("playerMat", scene);
    player.material.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.0); // Orange
    player.checkCollisions = true; // Enable collisions for the player
    player.ellipsoid = new BABYLON.Vector3(1, 1, 1); // Define the player's collision ellipsoid
    player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0); // Offset the ellipsoid to match the player's center

    // Camera (ArcRotateCamera to orbit around the player)
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2, // Initial horizontal angle
        Math.PI / 4, // Initial vertical angle
        20, // Distance from the player
        player.position, // Target the player
        scene
    );
    camera.attachControl(canvas, true); // Allow mouse/touch control for looking around

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Load the 3D Model as the World
    BABYLON.SceneLoader.ImportMesh(
        "", // Leave empty to load all meshes
        "./assets/", // Path to the model directory
        "level.obj", // Model file name
        scene,
        function (meshes) {
            // Success callback
            meshes.forEach((mesh) => {
                mesh.position = new BABYLON.Vector3(0, 0, 0); // Center the model
                mesh.scaling = new BABYLON.Vector3(5, 5, 5); // Scale the model
                mesh.checkCollisions = true; // Enable collisions
            });
            console.log("World model loaded successfully!");
        },
        null,
        function (scene, message, exception) {
            console.error("Error loading world model:", message, exception);
        }
    );

    // Add a Floor
    const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 500, height: 500 }, scene); // Large floor
    floor.material = new BABYLON.StandardMaterial("floorMat", scene);
    floor.material.diffuseColor = new BABYLON.Color3(0.4, 0.7, 0.4); // Grass-like color
    floor.checkCollisions = true; // Enable collisions for the floor

    // Player Movement
    const moveSpeed = 15; // Increased speed
    const dampingFactor = 0.9;
    const jumpForce = 10; // Increased jump height
    let isGrounded = false;
    let playerVelocity = new BABYLON.Vector3(0, 0, 0);

    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    engine.runRenderLoop(function () {
        const deltaTime = engine.getDeltaTime() / 1000.0;

        // Apply gravity
        playerVelocity.addInPlace(new BABYLON.Vector3(0, -9.81, 0).scale(deltaTime));

        // Movement relative to camera
        let moveDirection = BABYLON.Vector3.Zero();
        if (inputMap["w"]) {
            moveDirection.addInPlace(camera.getTarget().subtract(camera.position).normalize());
        }
        if (inputMap["s"]) {
            moveDirection.addInPlace(camera.getTarget().subtract(camera.position).normalize().scale(-1));
        }
        if (inputMap["d"]) {
            moveDirection.addInPlace(camera.getTarget().subtract(camera.position).cross(BABYLON.Axis.Y).normalize());
        }
        if (inputMap["a"]) {
            moveDirection.addInPlace(camera.getTarget().subtract(camera.position).cross(BABYLON.Axis.Y).normalize().scale(-1));
        }

        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            playerVelocity.x = moveDirection.x * moveSpeed;
            playerVelocity.z = moveDirection.z * moveSpeed;
        } else {
            playerVelocity.x *= dampingFactor;
            playerVelocity.z *= dampingFactor;
        }

        // Jumping
        if (inputMap[" "] && isGrounded) {
            playerVelocity.y = jumpForce; // Apply upward velocity
            isGrounded = false; // Player is now airborne
        }

        // Calculate next position based on current velocity
        const deltaPosition = playerVelocity.scale(deltaTime);
        player.moveWithCollisions(deltaPosition); // Use moveWithCollisions for collision detection

        // Check if the player is on the ground
        if (player.intersectsMesh(floor, false)) {
            isGrounded = true; // Player is on the ground
            playerVelocity.y = 0; // Reset vertical velocity
        }

        // Prevent clipping through the ground
        if (player.position.y < 1) {
            player.position.y = 1; // Reset position above the ground
            playerVelocity.y = 0; // Reset vertical velocity
            isGrounded = true;
        }

        // Render the scene
        scene.render();
    });

    // Show debug layer
    scene.debugLayer.show();

    return scene;
};

const scene = createScene();

window.addEventListener("resize", function () {
    engine.resize();
});
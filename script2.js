const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.9); // Sky color

    // Enable collisions in the scene
    scene.collisionsEnabled = true;

    // Player
    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 2 }, scene); // Revert to a box for the player
    player.position = new BABYLON.Vector3(0, 5, 0);
    player.material = new BABYLON.StandardMaterial("playerMat", scene);
    player.material.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.0); // Orange
    player.checkCollisions = true; // Enable collisions for the player
    player.ellipsoid = new BABYLON.Vector3(1, 1, 1); // Define the player's collision ellipsoid
    player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0); // Offset the ellipsoid to match the player's center

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2, // Initial horizontal angle
        Math.PI / 4, // Initial vertical angle
        15, // Distance from the player
        player.position, // Target the player
        scene
    );
    camera.attachControl(canvas, true); // Allow mouse/touch control for looking around

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Ground
    const groundSize = 200;
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: groundSize, height: groundSize, subdivisions: 50 }, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(0.4, 0.7, 0.4); // Grass color
    ground.checkCollisions = true; // Enable collisions for the ground

    // Forest (Trees and Rocks)
    const numberOfTrees = 100;
    const numberOfRocks = 50;
    const forestArea = groundSize / 2 - 5;

    const trunkMaterial = new BABYLON.StandardMaterial("trunkMat", scene);
    trunkMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1); // Brown
    const leafMaterial = new BABYLON.StandardMaterial("leafMat", scene);
    leafMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Green

    for (let i = 0; i < numberOfTrees; i++) {
        const x = (Math.random() - 0.5) * forestArea * 2;
        const z = (Math.random() - 0.5) * forestArea * 2;

        const trunkHeight = BABYLON.Scalar.RandomRange(3, 6);
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`trunk${i}`, { height: trunkHeight, diameterTop: 0.5, diameterBottom: 0.8 }, scene);
        trunk.position = new BABYLON.Vector3(x, trunkHeight / 2, z);
        trunk.material = trunkMaterial;
        trunk.checkCollisions = true; // Enable collisions for the tree trunk

        const leafHeight = BABYLON.Scalar.RandomRange(2, 4);
        const leaves = BABYLON.MeshBuilder.CreateSphere(`leaves${i}`, { diameter: leafHeight * 1.5 }, scene);
        leaves.position = new BABYLON.Vector3(x, trunkHeight + leafHeight * 0.5, z);
        leaves.material = leafMaterial;
        leaves.parent = trunk; // Attach leaves to the trunk
    }

    const rockMaterial = new BABYLON.StandardMaterial("rockMat", scene);
    rockMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Gray

    for (let i = 0; i < numberOfRocks; i++) {
        const x = (Math.random() - 0.5) * forestArea * 2;
        const z = (Math.random() - 0.5) * forestArea * 2;

        const rock = BABYLON.MeshBuilder.CreateSphere(`rock${i}`, { diameter: BABYLON.Scalar.RandomRange(0.5, 2) }, scene);
        rock.position = new BABYLON.Vector3(x, rock.getBoundingInfo().boundingBox.extendSize.y, z);
        rock.material = rockMaterial;
        rock.checkCollisions = true; // Enable collisions for rocks
    }

    // Player Movement
    const moveSpeed = 8;
    const dampingFactor = 0.9;
    const jumpForce = 5;
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
            moveDirection.addInPlace(camera.getForwardRay().direction);
        }
        if (inputMap["s"]) {
            moveDirection.addInPlace(camera.getForwardRay().direction.scale(-1));
        }
        if (inputMap["d"]) {
            moveDirection.addInPlace(camera.getForwardRay().direction.cross(BABYLON.Axis.Y).normalize().scale(-1));
        }
        if (inputMap["a"]) {
            moveDirection.addInPlace(camera.getForwardRay().direction.cross(BABYLON.Axis.Y).normalize());
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
        if (player.intersectsMesh(ground, false)) {
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

    return scene;
};

const scene = createScene();

window.addEventListener("resize", function () {
    engine.resize();
});
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.9); // A slightly more natural sky color

    // Camera (Free camera allows WASD movement out of the box, but we'll control our player separately)
    // Let's use a follow camera or just position a FreeCamera behind the player initially
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 10, -20), scene); // Adjusted camera start pos
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true); // Allow mouse/touch control for looking around

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8; // Slightly increased intensity for outdoor feel

    // --- Game Elements (Open Forest Environment) ---

    // Ground (Much Larger and Green with simple hills)
    const groundSize = 200; // Make the ground much larger
    const groundSubdivisions = 50; // More subdivisions for smoother hills
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: groundSize, height: groundSize, subdivisions: groundSubdivisions }, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(0.4, 0.7, 0.4); // Green grass color
    ground.checkCollisions = true; // Enable collisions

    // Simple Hill Generation (Manually adjusting ground vertices)
    const groundVertexData = BABYLON.VertexData.ExtractFromGeometry(ground);
    const positions = groundVertexData.positions;
    const hillHeightScale = 5; // How tall the hills can be
    const hillFrequency = 0.02; // How spread out the hills are

    // Add some random undulation to the ground vertices
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];

        // A simple wavy pattern based on x and z, combined with some randomness
        const yOffset = Math.sin(x * hillFrequency) * Math.cos(z * hillFrequency) * hillHeightScale * 0.5 +
                      (Math.random() - 0.5) * hillHeightScale * 0.2; // Add some noise

        positions[i + 1] = yOffset; // Adjust the Y position
    }
    groundVertexData.applyToMesh(ground); // Apply the modified positions back to the mesh

    // --- Removed Walls ---
    /*
    const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9); // Light gray walls
    // ... wall creation code removed ...
    */


    // Platforms (Keeping the platforms, positioned within the larger area)
    const platformMaterial = new BABYLON.StandardMaterial("platformMat", scene);
    platformMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2); // Brown platforms (like wood)

    const platform1 = BABYLON.MeshBuilder.CreateBox("platform1", { width: 4, height: 0.5, depth: 4 }, scene);
    platform1.position = new BABYLON.Vector3(20, 2, -15); // Adjusted position
    platform1.material = platformMaterial;
    platform1.checkCollisions = true; // Enable collisions

    const platform2 = BABYLON.MeshBuilder.CreateBox("platform2", { width: 4, height: 0.5, depth: 4 }, scene);
    platform2.position = new BABYLON.Vector3(-30, 5, 25); // Adjusted position
    platform2.material = platformMaterial;
    platform2.checkCollisions = true; // Enable collisions

    const platform3 = BABYLON.MeshBuilder.CreateBox("platform3", { width: 3, height: 0.5, depth: 3 }, scene);
    platform3.position = new BABYLON.Vector3(40, 8, 10); // Adjusted position
    platform3.material = platformMaterial;
    platform3.checkCollisions = true; // Enable collisions

    // More Platforms
     const platform4 = BABYLON.MeshBuilder.CreateBox("platform4", { width: 5, height: 0.5, depth: 5 }, scene);
    platform4.position = new BABYLON.Vector3(-50, 3, -30);
    platform4.material = platformMaterial;
    platform4.checkCollisions = true;

    const platform5 = BABYLON.MeshBuilder.CreateBox("platform5", { width: 3, height: 0.5, depth: 3 }, scene);
    platform5.position = new BABYLON.Vector3(0, 6, 40);
    platform5.material = platformMaterial;
    platform5.checkCollisions = true;


    // Simple Trees (More of them, spread over a larger area)
    const numberOfTrees = 200; // Increased tree count
    const treeAreaSize = groundSize / 2 - 5; // Place trees almost up to the edge

    const trunkMaterial = new BABYLON.StandardMaterial("trunkMat", scene);
    trunkMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1); // Brown
    const leafMaterial = new BABYLON.StandardMaterial("leafMat", scene);
    leafMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Green

    for (let i = 0; i < numberOfTrees; i++) {
        // Random position within the area
        const x = (Math.random() - 0.5) * treeAreaSize * 2;
        const z = (Math.random() - 0.5) * treeAreaSize * 2;

        // Get the ground height at this position to place the tree correctly
        // This requires raycasting or sampling the heightmap/vertex data, which is complex.
        // For simplicity, we'll estimate the ground height or place them slightly above 0.
        // A proper implementation would get the exact Y coordinate of the ground at (x, z).
        // For now, we'll place them slightly above 0 and hope the hills aren't too steep there.
        const groundY = scene.getMeshByName("ground").getHeightAtCoordinates(x, z); // Use getHeightAtCoordinates if ground is from heightmap or calculable

        // Simple Trunk (Cylinder)
        const trunkHeight = BABYLON.Scalar.RandomRange(3, 6);
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`trunk${i}`, { height: trunkHeight, diameterTop: 0.5, diameterBottom: 0.8 }, scene);
        // trunk.position = new BABYLON.Vector3(x, trunkHeight / 2 + (groundY || 0), z); // Position trunk base on ground height
        trunk.position = new BABYLON.Vector3(x, trunkHeight / 2 + 0.1, z); // Simplified position slightly above 0

        trunk.material = trunkMaterial;


        // Simple Leaves (Sphere or Cone)
        const leafHeight = BABYLON.Scalar.RandomRange(2, 4);
        const leaves = BABYLON.MeshBuilder.CreateSphere(`leaves${i}`, { diameter: leafHeight * 1.5 }, scene); // Using sphere
        // leaves.position = new BABYLON.Vector3(x, trunkHeight + leafHeight * 0.5 + (groundY || 0), z); // Position leaves above trunk on ground height
         leaves.position = new BABYLON.Vector3(x, trunkHeight + leafHeight * 0.5 + 0.1, z); // Simplified position

        leaves.material = leafMaterial;

        // Parent leaves to trunk to move/rotate together
        leaves.parent = trunk;
    }

    // Simple Rocks
    const numberOfRocks = 100;
    const rockAreaSize = groundSize / 2 - 5; // Place rocks within the area

    const rockMaterial = new BABYLON.StandardMaterial("rockMat", scene);
    rockMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Dark gray

    for (let i = 0; i < numberOfRocks; i++) {
         const x = (Math.random() - 0.5) * rockAreaSize * 2;
        const z = (Math.random() - 0.5) * rockAreaSize * 2;

        const rock = BABYLON.MeshBuilder.CreateSphere(`rock${i}`, { diameter: BABYLON.Scalar.RandomRange(0.5, 2) }, scene);
        // Place slightly above 0, ideally would use ground height
        // const groundY = scene.getMeshByName("ground").getHeightAtCoordinates(x, z); // Use getHeightAtCoordinates
        // rock.position = new BABYLON.Vector3(x, rock.getBoundingInfo().boundingBox.extendSize.y + (groundY || 0), z);
        rock.position = new BABYLON.Vector3(x, rock.getBoundingInfo().boundingBox.extendSize.y + 0.1, z); // Simplified position

        rock.material = rockMaterial;
        rock.checkCollisions = true; // Rocks can be collidable obstacles
    }


    // Player
    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
    player.position = new BABYLON.Vector3(0, 5, 0); // Start higher up to land on ground/hill
    player.material = new BABYLON.StandardMaterial("playerMat", scene);
    player.material.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.0); // Orange player
    player.checkCollisions = true; // Enable collisions for the player


    // --- Player Movement and Physics ---

    let gravity = new BABYLON.Vector3(0, -9.81, 0); // Earth gravity
    let playerVelocity = new BABYLON.Vector3(0, 0, 0);

    // Camera variables
    let cameraAngle = 0; // Initial angle (in radians)
    const cameraDistance = 15; // Distance from the player
    const cameraHeight = 8; // Height of the camera above the player
    const cameraRotationSpeed = 0.05; // Speed of camera rotation

    // Update the camera's position based on the angle
    function updateCameraPosition() {
        const x = player.position.x + cameraDistance * Math.sin(cameraAngle);
        const z = player.position.z + cameraDistance * Math.cos(cameraAngle);
        const y = player.position.y + cameraHeight; // Keep the camera slightly above the player
        camera.position.set(x, y, z);
        camera.setTarget(player.position); // Make the camera look at the player
    }

    // Add event listeners for arrow key input to rotate the camera
    window.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            cameraAngle -= cameraRotationSpeed; // Rotate counterclockwise
        } else if (event.key === "ArrowRight") {
            cameraAngle += cameraRotationSpeed; // Rotate clockwise
        }
        updateCameraPosition(); // Update the camera's position after changing the angle
    });

    // Player movement variables
    const moveSpeed = 8; // How fast the player moves horizontally
    const dampingFactor = 0.9; // To smoothly stop horizontal movement
    const jumpForce = 5; // How high the player jumps
    let isGrounded = false; // Whether the player is on the ground

    // Input handling
    let inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    // Game loop - Update player position and handle physics
    engine.runRenderLoop(function () {
        const deltaTime = engine.getDeltaTime() / 1000.0; // Time in seconds

        // Apply gravity
        playerVelocity.addInPlace(gravity.scale(deltaTime));

        // Horizontal movement input
        let moveDirection = BABYLON.Vector3.Zero();
        if (inputMap["w"] || inputMap["arrowup"]) {
            // Move forward relative to the camera
            moveDirection.addInPlace(camera.getForwardRay().direction);
        }
        if (inputMap["s"] || inputMap["arrowdown"]) {
            // Move backward relative to the camera
            moveDirection.addInPlace(camera.getForwardRay().direction.scale(-1));
        }
        if (inputMap["d"] || inputMap["arrowleft"]) {
            // Move left relative to the camera
            moveDirection.addInPlace(camera.getForwardRay().direction.cross(BABYLON.Axis.Y).normalize().scale(-1));
        }
        if (inputMap["a"] || inputMap["arrowright"]) {
            // Move right relative to the camera
            moveDirection.addInPlace(camera.getForwardRay().direction.cross(BABYLON.Axis.Y).normalize());
        }

        // Normalize movement direction and apply speed
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            playerVelocity.x = moveDirection.x * moveSpeed;
            playerVelocity.z = moveDirection.z * moveSpeed;
        } else {
            // Apply damping if no horizontal input to slow down
            playerVelocity.x *= dampingFactor;
            playerVelocity.z *= dampingFactor;
        }

        // Jump input
        if ((inputMap[" "] || inputMap["spacebar"]) && isGrounded) {
            playerVelocity.y = jumpForce; // Apply upward velocity
            isGrounded = false; // Player is now airborne
        }

        // Calculate next position based on current velocity
        let deltaPosition = playerVelocity.scale(deltaTime);
        let nextPosition = player.position.add(deltaPosition);

        // Collision detection and ground check logic (unchanged)
        let hitGroundThisFrame = false;
        const objectsToCollideWith = [ground, platform1, platform2, platform3, platform4, platform5, ...scene.getMeshesByTags("rock")];

        if (playerVelocity.y <= 0) {
            for (const mesh of objectsToCollideWith) {
                const playerBoundingBox = player.getBoundingInfo().boundingBox;
                const meshBoundingBox = mesh.getBoundingInfo().boundingBox;

                const playerBottomY_next = nextPosition.y - playerBoundingBox.extendSize.y;
                const meshTopY = mesh.position.y + meshBoundingBox.extendSize.y;

                if (player.position.y >= meshTopY && playerBottomY_next <= meshTopY) {
                    if (nextPosition.x + playerBoundingBox.extendSize.x > meshBoundingBox.minimumWorld.x &&
                        nextPosition.x - playerBoundingBox.extendSize.x < meshBoundingBox.maximumWorld.x &&
                        nextPosition.z + playerBoundingBox.extendSize.z > meshBoundingBox.minimumWorld.z &&
                        nextPosition.z - playerBoundingBox.extendSize.z < meshBoundingBox.maximumWorld.z) {

                        nextPosition.y = meshTopY + playerBoundingBox.extendSize.y;
                        playerVelocity.y = 0;
                        isGrounded = true;
                        hitGroundThisFrame = true;
                    }
                }
            }
        }

        if (playerVelocity.y < 0 && !hitGroundThisFrame) {
            isGrounded = false;
        } else if (playerVelocity.y > 0) {
            isGrounded = false;
        }

        player.position.copyFrom(nextPosition);

        if (player.position.y < -20) {
            player.position = new BABYLON.Vector3(0, 10, 0);
            playerVelocity = BABYLON.Vector3.Zero();
            isGrounded = false;
        }

        updateCameraPosition();

        scene.render();
    });

    return scene;
};

const scene = createScene();


// Resize the engine when the window is resized
window.addEventListener("resize", function () {
    engine.resize();
});
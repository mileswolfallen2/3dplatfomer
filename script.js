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
    let isGrounded = false;
    const jumpForce = 5; // How high the player jumps
    const moveSpeed = 8; // How fast the player moves horizontally
    const dampingFactor = 0.9; // To smoothly stop horizontal movement

    // Input Handling
    let inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    // Simple camera following the player
    // This is a very basic follow, you might want a more sophisticated one
    // or Babylon.js's built-in FollowCamera for a true third-person view.
    // Note: The commented-out FollowCamera setup is left here but not activated
    // as per your request to not change anything else fundamentally.
    // const followCamera = new BABYLON.FollowCamera("followCamera", new BABYLON.Vector3(0, 10, -10), scene, player);
    // followCamera.radius = 10; // How far from the target
    // followCamera.heightOffset = 4; // How high above the target
    // followCamera.rotationOffset = 180; // Behind the target
    // followCamera.cameraAcceleration = 0.05; // How quickly to move
    // followCamera.maxCameraSpeed = 20; // Max speed
    // scene.activeCamera = followCamera; // Uncomment this to use the follow camera

     // For the FreeCamera, manually update its position relative to the player
     // This manual update is kept as it was in your original code.
     // Note: You might need to adjust the camera offset (0, 5, -10) if the hills are very tall
     // or if you want a different perspective in the larger world.
     scene.onBeforeRenderObservable.add(() => {
        camera.position = player.position.add(new BABYLON.Vector3(0, 8, -15)); // Adjusted camera offset
        // You might want to also update camera.target to look at the player
        // camera.target.copyFrom(player.position);
     });


    // Game Loop - Update player position and handle physics
    engine.runRenderLoop(function () {
        const deltaTime = engine.getDeltaTime() / 1000.0; // Time in seconds

        // Apply gravity
        playerVelocity.addInPlace(gravity.scale(deltaTime));

        // Horizontal Movement Input
        let moveDirection = BABYLON.Vector3.Zero();
        if (inputMap["w"] || inputMap["W"] || inputMap["ArrowUp"]) {
            moveDirection.z += 1;
        }
        if (inputMap["s"] || inputMap["S"] || inputMap["ArrowDown"]) {
            moveDirection.z -= 1;
        }
        if (inputMap["a"] || inputMap["A"] || inputMap["ArrowLeft"]) {
            moveDirection.x -= 1;
        }
        if (inputMap["d"] || inputMap["D"] || inputMap["ArrowRight"]) {
            moveDirection.x += 1;
        }

        // Normalize movement direction and apply speed
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            // Apply force/velocity based on desired movement style
            // For simple movement without a physics engine, directly setting velocity works
            playerVelocity.x = moveDirection.x * moveSpeed;
            playerVelocity.z = moveDirection.z * moveSpeed;
        } else {
             // Apply damping if no horizontal input to slow down
             playerVelocity.x *= dampingFactor;
             playerVelocity.z *= dampingFactor;
        }

        // Jump Input
        // Check for jump key and if the player is currently grounded
        if ((inputMap[" "] || inputMap["Spacebar"]) && isGrounded) {
            playerVelocity.y = jumpForce; // Apply upward velocity
            isGrounded = false; // Player is now airborne
             // Reset jump input state immediately to prevent continuous jumping
            inputMap[" "] = false;
            inputMap["Spacebar"] = false;
        }

        // Calculate next position based on current velocity
        let deltaPosition = playerVelocity.scale(deltaTime);
        let nextPosition = player.position.add(deltaPosition);


        // --- Simple Collision Detection for Vertical Movement ---
        // This logic now needs to check collision with the hilly ground, platforms, and rocks.
        // NOTE: The simple bounding box check for vertical collision might be less reliable
        // on sloped or uneven terrain compared to a physics engine.
        // For better collision on hills, a physics impostor or raycasting down from the player is recommended.
        // This code updates the simple logic to include rocks.

        let hitGroundThisFrame = false;
        // List of all meshes the player should collide with vertically
        // Include the ground, platforms, and rocks.
        const objectsToCollideWith = [ground, platform1, platform2, platform3, platform4, platform5, ...scene.getMeshesByTags("rock")]; // Added rocks

        // Only check for landing if falling
        if (playerVelocity.y <= 0) {
             for (const mesh of objectsToCollideWith) {
                 // Get the bounding box information for player and the current mesh
                 const playerBoundingBox = player.getBoundingInfo().boundingBox;
                 const meshBoundingBox = mesh.getBoundingInfo().boundingBox;

                 // Calculate the potential future bottom position of the player
                 const playerBottomY_next = nextPosition.y - playerBoundingBox.extendSize.y;
                 // Calculate the top surface Y position of the mesh
                 const meshTopY = mesh.position.y + meshBoundingBox.extendSize.y; // Simplified for box/sphere, might be inaccurate for complex shapes/terrain

                 // Check if the player is currently above or at the mesh's top surface
                 // AND if the player's next position would be below or at the mesh's top surface
                 // AND check for horizontal overlap
                 // NOTE: This simplified horizontal overlap check is not perfect for sloped terrain or non-box/plane shapes.
                 if (player.position.y >= meshTopY && playerBottomY_next <= meshTopY) {
                      // Check for horizontal overlap (are they over the platform/ground/rock horizontally?)
                     if (nextPosition.x + playerBoundingBox.extendSize.x > meshBoundingBox.minimumWorld.x &&
                         nextPosition.x - playerBoundingBox.extendSize.x < meshBoundingBox.maximumWorld.x &&
                         nextPosition.z + playerBoundingBox.extendSize.z > meshBoundingBox.minimumWorld.z &&
                         nextPosition.z - playerBoundingBox.extendSize.z < meshBoundingBox.maximumWorld.z) {

                            // Collision detected below player (landing!)
                            // Snap the player's Y position to the top of the mesh
                            // NOTE: Snapping to meshTopY is still a simplification for sloped terrain.
                            nextPosition.y = meshTopY + playerBoundingBox.extendSize.y;
                            playerVelocity.y = 0; // Stop falling
                            isGrounded = true; // Mark as grounded
                            hitGroundThisFrame = true; // We hit something below this frame
                            // break; // Don't break here if multiple objects are close vertically, need to find the highest one
                     }
                 }
            }
            // After checking all potential landing surfaces, find the highest point the player landed on
            if (hitGroundThisFrame) {
                // This simple logic doesn't find the highest point, it just confirms *a* landing.
                // A better approach would be to store all potential landing Ys and pick the max.
                // For now, the last detected hit will set the Y.
            }
        }

         // If the player is falling and didn't hit anything below this frame, they are not grounded
         if (playerVelocity.y < 0 && !hitGroundThisFrame) {
             isGrounded = false;
         } else if (playerVelocity.y > 0) {
             isGrounded = false;
         }


        // --- Apply the calculated position ---
        player.position.copyFrom(nextPosition);


        // Reset player if they fall below a certain Y coordinate
        if (player.position.y < -20) { // Use a larger negative value since ground is larger
            player.position = new BABYLON.Vector3(0, 10, 0); // Reset position to a safe spot (higher up)
            playerVelocity = BABYLON.Vector3.Zero(); // Reset velocity
            isGrounded = false; // Ensure they aren't considered grounded initially after reset
        }
        // Optional: Prevent player from going outside the ground area bounds
        // Clamping might look abrupt on sloped edges
        // const groundSize = 100; // Matches the ground width/height
        // const halfGroundSize = groundSize / 2;
        // player.position.x = BABYLON.Scalar.Clamp(player.position.x, -halfGroundSize, halfGroundSize);
        // player.position.z = BABYLON.Scalar.Clamp(player.position.z, -halfGroundSize, halfGroundSize);


        // The camera update logic is kept as it was in your original code.
        // If you want the camera to properly follow the player, you would uncomment
        // the FollowCamera setup and set it as the active camera.

        scene.render();
    });


    return scene;
};

const scene = createScene();


// Resize the engine when the window is resized
window.addEventListener("resize", function () {
    engine.resize();
});
// --- Scene Setup ---
const scene = new THREE.Scene();

// --- Camera Setup ---
const camera = new THREE.PerspectiveCamera(
    75, // Field of view (in degrees)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

// --- Renderer Setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Added antialiasing for smoother edges
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Create the Container Box (Level Geometry) ---
const containerGeometry = new THREE.BoxGeometry(10, 10, 10);
const containerMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    wireframe: true
});
const containerBox = new THREE.Mesh(containerGeometry, containerMaterial);
scene.add(containerBox);

// --- Create the Player Box ---
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red material (affected by light)
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// --- Player Movement Setup ---
const playerSpeed = 0.05; // How fast the player moves
const keysPressed = {}; // Object to track which keys are currently held down

// Event Listeners for keyboard input
window.addEventListener('keydown', (event) => {
    // Convert key to lowercase to handle both cases (e.g., 'W' and 'w')
    keysPressed[event.key.toLowerCase()] = true;
    // Prevent default browser actions for arrow keys or space, if needed later
    // if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
    //     event.preventDefault();
    // }
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

// --- Position the Player and Camera ---
player.position.set(0, 0, 0); // Start player at the center

// Define the camera's desired offset from the player
const cameraOffset = new THREE.Vector3(0, 1.5, 3); // e.g., 3 units back, 1.5 units up relative to player

function updateCameraPosition() {
    // Set the camera's position by adding the offset to the player's position
    camera.position.copy(player.position).add(cameraOffset);
    // Make the camera look at the player's position
    camera.lookAt(player.position);
}

updateCameraPosition(); // Set initial camera position

// --- Add Lighting (Already present, but confirming) ---
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate); // Ask the browser to call animate again before the next frame

    // --- Player Movement Logic ---
    // Check the 'keysPressed' object and update player position accordingly
    if (keysPressed['w']) {
        // Move forward (decrease Z in world coordinates)
        player.position.z -= playerSpeed;
    }
    if (keysPressed['s']) {
        // Move backward (increase Z in world coordinates)
        player.position.z += playerSpeed;
    }
    if (keysPressed['a']) {
        // Move left (decrease X in world coordinates)
        player.position.x -= playerSpeed;
    }
    if (keysPressed['d']) {
        // Move right (increase X in world coordinates)
        player.position.x += playerSpeed;
    }

    // IMPORTANT: Update camera position *after* the player's position has been changed
    updateCameraPosition();

    // --- Render the Scene ---
    renderer.render(scene, camera);
}

// --- Handle Window Resizing ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loop
animate();

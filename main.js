
// --- Basic Three.js Setup ---

// 1. Create a Scene: This is the container for all your 3D objects, lights, and cameras.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Optional: Add a sky blue background

// 2. Create a Camera: This defines the viewpoint from which you see the scene.
// PerspectiveCamera( fieldOfView, aspectRatio, near, far )
const camera = new THREE.PerspectiveCamera(
    75, // Field of view (vertical, in degrees)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane (objects closer than this aren't rendered)
    1000 // Far clipping plane (objects farther than this aren't rendered)
);

// 3. Create a Renderer: This renders the scene using WebGL onto an HTML <canvas> element.
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias helps smooth edges
renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the renderer to the window size
// Add the renderer's canvas element to the HTML document body
document.body.appendChild(renderer.domElement);

// --- Create 3D Objects ---

// Create the Container Box (Wireframe)
// Geometry: Defines the shape of the object (a box 10x10x10 units)
const containerGeometry = new THREE.BoxGeometry(10, 10, 10);
// Material: Defines how the object looks (basic grey, wireframe means show only edges)
const containerMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa, // A light grey color
    wireframe: true // Display as a wireframe
});
// Mesh: Combines the geometry and material into a single object to be added to the scene
const containerBox = new THREE.Mesh(containerGeometry, containerMaterial);
scene.add(containerBox); // Add the container box to the scene

// Create the Player Box (Red, Solid)
// Geometry: A simple 1x1x1 box for the player
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
// Material: A Phong material reacts to light, giving the box shading
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Bright red color
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player); // Add the player box to the scene

// --- Position Player and Camera ---

// Set the initial position of the player inside the container (e.g., slightly above the center)
player.position.set(0, -4, 0); // Position X=0, Y=-4, Z=0

// Define the camera's offset relative to the player's position
// This vector describes how far behind (Z+), above (Y+), and to the side (X) the camera should be
const cameraOffset = new THREE.Vector3(0, 1.5, 3); // 3 units back, 1.5 units up

// Function to update the camera's position and make it look at the player
function updateCameraPosition() {
    // Set the camera's position to the player's position plus the defined offset
    camera.position.copy(player.position).add(cameraOffset);
    // Make the camera look directly at the player's current position
    camera.lookAt(player.position);
}

// Set the initial camera position before the animation starts
updateCameraPosition();

// --- Add Lighting ---

// Ambient Light: Provides uniform light to all objects, preventing completely dark areas.
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

// Directional Light: Simulates light from a source like the sun, casting directional shadows (though not implemented here).
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // White light with moderate intensity
directionalLight.position.set(5, 5, 5).normalize(); // Position the light source, normalize makes direction consistent
scene.add(directionalLight);

// --- Player Movement Variables and Input Handling ---

const playerSpeed = 0.08; // How many units the player moves per frame
const keysPressed = {}; // An object to keep track of which keys are currently pressed

// Add event listeners for key presses and releases
window.addEventListener('keydown', (event) => {
    // Store the pressed key (converted to lowercase) in the keysPressed object
    keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
    // When a key is released, set its state in keysPressed to false
    keysPressed[event.key.toLowerCase()] = false;
});


// --- The Animation Loop ---

// The animate function will be called repeatedly by the browser to update and render the scene.
function animate() {
    requestAnimationFrame(animate); // Request the browser to call animate again before the next frame

    // --- Game Logic Updates ---

    // Player Movement Logic based on pressed keys (WASD)
    if (keysPressed['w']) {
        player.position.z -= playerSpeed; // Move forward (decrease Z)
    }
    if (keysPressed['s']) {
        player.position.z += playerSpeed; // Move backward (increase Z)
    }
    if (keysPressed['a']) {
        player.position.x -= playerSpeed; // Move left (decrease X)
    }
    if (keysPressed['d']) {
        player.position.x += playerSpeed; // Move right (increase X)
    }
    // Note: Y-axis movement (for jumping/gravity) is not included yet.

    // --- Update Camera Position ---
    // It's crucial to update the camera *after* updating the player's position
    updateCameraPosition();

    // --- Render the Scene ---
    renderer.render(scene, camera); // Render the scene with the camera

}

// --- Handle Window Resizing ---
// This ensures the scene scales correctly if the browser window is resized.
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
    camera.updateProjectionMatrix(); // Update the camera's projection matrix
    renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size
});

// Start the animation loop to begin rendering and processing game logic
animate();
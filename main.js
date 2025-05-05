// --- Scene Setup ---
const scene = new THREE.Scene();

// --- Camera Setup ---
// PerspectiveCamera( fieldOfView, aspectRatio, near, far )
const camera = new THREE.PerspectiveCamera(
    75, // Field of view (in degrees)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

// --- Renderer Setup ---
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add the canvas to the HTML body

// --- Create the Container Box (Level Geometry) ---
// We'll make this a wireframe box so we can see inside
const containerGeometry = new THREE.BoxGeometry(10, 10, 10); // A 10x10x10 box
const containerMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc, // Grey color
    wireframe: true // Show only the edges
});
const containerBox = new THREE.Mesh(containerGeometry, containerMaterial);
scene.add(containerBox);

// --- Create the Player Box ---
const playerGeometry = new THREE.BoxGeometry(1, 1, 1); // A 1x1x1 player box
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red material
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// --- Position the Player and Camera ---
// Position the player box slightly off the center for visibility
player.position.set(0, 0, 0); // Start at the center of the container

// Position the camera behind the player
// We'll offset it relative to the player's position
const cameraOffset = new THREE.Vector3(0, 1, 3); // e.g., 3 units back, 1 unit up relative to player

function updateCameraPosition() {
    // Set the camera's position based on the player's position plus the offset
    camera.position.copy(player.position).add(cameraOffset);
    // Make the camera look at the player's position
    camera.lookAt(player.position);
}

updateCameraPosition(); // Set initial camera position

// --- Add Lighting ---
// Add some ambient light so the red material (MeshPhongMaterial) is visible
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

// Add a directional light for clearer shading
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // White light with intensity
directionalLight.position.set(5, 5, 5).normalize(); // Position the light
scene.add(directionalLight);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate); // Ask the browser to call animate again before the next frame

    // --- Game Logic Updates (Placeholder) ---
    // This is where you would put player movement, physics, etc.
    // For now, let's just rotate the player and container slightly to show it's working
    player.rotation.x += 0.005;
    player.rotation.y += 0.005;

    // containerBox.rotation.x += 0.001;
    // containerBox.rotation.y += 0.001;

    // If player position changes, update the camera
    // updateCameraPosition();

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

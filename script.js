// --- 1. TERMINAL LOADING SCREEN ---
let progress = 0;
const progressEl = document.getElementById('progress');
const loader = document.getElementById('loader');

const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5; 
    if (progress >= 100) {
        progress = 100;
        progressEl.innerText = progress;
        clearInterval(loadInterval);
        setTimeout(() => {
            loader.classList.add('loader-hidden');
            if(typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }, 500); 
    } else {
        progressEl.innerText = progress;
    }
}, 150);

// --- 2. SMOOTH NAVIGATION ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// --- 3. THREE.JS SETUP ---
const canvas = document.getElementById('galaxy-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const masterGroup = new THREE.Group();
const galaxyGroup = new THREE.Group();
masterGroup.add(galaxyGroup);
scene.add(masterGroup);

// --- 4. GALAXY & JETS ---
const particlesCount = 15000;
const jetCount = 2000;
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const galaxyRadius = 12; 

for(let i = 0; i < particlesCount * 3; i += 3) {
    const radius = Math.pow(Math.random(), 1.5) * galaxyRadius; 
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius + (Math.random() - 0.5);
    const y = (Math.random() - 0.5) * (1.5 - (radius / galaxyRadius)); 
    const z = Math.sin(angle) * radius + (Math.random() - 0.5);
    posArray[i] = x; posArray[i + 1] = y; posArray[i + 2] = z;
    const intensity = 1 - (radius / galaxyRadius); 
    const shadeVar = Math.random() * 0.2;
    colors[i] = 0.2 + (intensity * 0.8) + shadeVar;     
    colors[i + 1] = (intensity * 0.2);                  
    colors[i + 2] = 0.5 + (intensity * 0.4) + shadeVar; 
}

for(let i = 0; i < jetCount; i++) {
    const t = Math.random();
    const direction = Math.random() < 0.5 ? 1 : -1;
    const idx = (particlesCount - jetCount + i) * 3;
    posArray[idx] = (Math.random() - 0.5) * 0.4;
    posArray[idx + 1] = direction * (2 + t * 15); 
    posArray[idx + 2] = (Math.random() - 0.5) * 0.4;
    colors[idx] = 0.7 + Math.random() * 0.3;     
    colors[idx + 1] = 0.1 + Math.random() * 0.3; 
    colors[idx + 2] = 0.9 + Math.random() * 0.1; 
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.015, vertexColors: true, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false 
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
galaxyGroup.add(particlesMesh);

camera.position.set(0, 4, 10);
camera.rotation.x = -0.3;

// --- 5. MOUSE INTERACTION ---
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// --- 6. GSAP SCROLL REVEAL ---
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
        scrollTrigger: { trigger: "#main-container", start: "top top", end: "bottom bottom", scrub: 1 }
    });
    tl.to(camera.position, { z: 6, y: 1, x: 2, ease: "power1.inOut" }, 0);
    tl.to(camera.rotation, { x: 0, y: 0.2, ease: "power1.inOut" }, 0);
    tl.to(galaxyGroup.rotation, { z: 0.3, ease: "power1.inOut" }, 0);
    tl.to(camera.position, { z: 12, y: -1, x: -3, ease: "power1.inOut" }, 1);
    tl.to(camera.rotation, { x: 0.2, y: -0.3, ease: "power1.inOut" }, 1);
    tl.to(galaxyGroup.rotation, { x: 1.2, z: -0.2, ease: "power1.inOut" }, 1);
    tl.to(camera.position, { z: 15, y: 5, x: 0, ease: "power1.inOut" }, 2);
    tl.to(camera.rotation, { x: -0.3, y: 0, ease: "power1.inOut" }, 2);
    tl.to(galaxyGroup.rotation, { x: 0, z: 0, y: Math.PI, ease: "power1.inOut" }, 2);

    gsap.utils.toArray('.about-content, .project-card, .timeline-content, .social-icon-btn').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play reverse play reverse" } });
    });
}

// --- 7. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    targetX = mouseX * 0.001; targetY = mouseY * 0.001;
    masterGroup.rotation.y += 0.05 * (targetX - masterGroup.rotation.y);
    masterGroup.rotation.x += 0.05 * (targetY - masterGroup.rotation.x);
    particlesMesh.rotation.y += 0.002;
    const positions = particlesGeometry.attributes.position.array;
    for(let i = 0; i < jetCount; i++) {
        const idx = (particlesCount - jetCount + i) * 3;
        let y = positions[idx + 1];
        if (y > 0) { y += 0.06; if (y > 15) y = Math.random() * 2; } 
        else { y -= 0.06; if (y < -15) y = -(Math.random() * 2); }
        positions[idx + 1] = y;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}
animate();

// --- 8. RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

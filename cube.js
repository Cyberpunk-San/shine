// cube.js - Three.js Enhanced 2x2 Cube Game - FIXED DISPLAY VERSION
(function() {
    'use strict';
    
    let cubeGame = {
        isActive: false,
        scene: null,
        camera: null,
        renderer: null,
        cubeGroup: null,
        cubies: [],
        moves: 0,
        isSolved: true,
        isAnimating: false,
        isDragging: false,
        currentRotation: { x: -Math.PI/6, y: -Math.PI/4 }
    };

    const CUBE_COLORS = {
        front: 0xff4444,
        back: 0x00cc99,
        right: 0x4488ff,
        left: 0x44dd44,
        top: 0xffff44,
        bottom: 0xff44ff
    };

    function initCubeGame() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded');
            showNotification('Failed to load cube game. Please check your internet connection.', 'error');
            return;
        }

        console.log('Initializing Three.js cube game...');

        // Use the placeholder div
        const placeholder = document.getElementById('cube-game-placeholder');
        if (!placeholder) {
            console.error('Cube game placeholder not found');
            showNotification('Cube game container not found.', 'error');
            return;
        }

        // Remove any existing game container
        const containerId = 'cube-game-container-unique';
        let gameContainer = document.getElementById(containerId);
        if (gameContainer) {
            gameContainer.remove();
        }

        // Create game container
        gameContainer = document.createElement('div');
        gameContainer.id = containerId;
        gameContainer.className = 'cube-game-container';
        gameContainer.innerHTML = `
            <div class="cube-game">
                <div class="game-header">
                    <div class="header-icon">🧊</div>
                    <h1>2×2 Twisted Cube Game</h1>
                    <p class="game-subtitle">Master the pocket cube! Rotate the faces to solve this classic puzzle.</p>
                </div>
                <div class="cube-scene-container">
                    <div class="threejs-scene" id="threejs-scene"></div>
                    <div class="color-legend">
                        <div class="color-item"><div class="color-swatch front-color"></div><span>Front</span></div>
                        <div class="color-item"><div class="color-swatch back-color"></div><span>Back</span></div>
                        <div class="color-item"><div class="color-swatch right-color"></div><span>Right</span></div>
                        <div class="color-item"><div class="color-swatch left-color"></div><span>Left</span></div>
                        <div class="color-item"><div class="color-swatch top-color"></div><span>Top</span></div>
                        <div class="color-item"><div class="color-swatch bottom-color"></div><span>Bottom</span></div>
                    </div>
                </div>
                <div class="game-controls">
                    <div class="control-group">
                        <h3>Face Rotations</h3>
                        <div class="rotation-controls">
                            <button class="control-btn" data-move="U" aria-label="Rotate upper face clockwise">U</button>
                            <button class="control-btn" data-move="U'" aria-label="Rotate upper face counterclockwise">U'</button>
                            <button class="control-btn" data-move="D" aria-label="Rotate lower face clockwise">D</button>
                            <button class="control-btn" data-move="D'" aria-label="Rotate lower face counterclockwise">D'</button>
                            <button class="control-btn" data-move="L" aria-label="Rotate left face clockwise">L</button>
                            <button class="control-btn" data-move="L'" aria-label="Rotate left face counterclockwise">L'</button>
                            <button class="control-btn" data-move="R" aria-label="Rotate right face clockwise">R</button>
                            <button class="control-btn" data-move="R'" aria-label="Rotate right face counterclockwise">R'</button>
                            <button class="control-btn" data-move="F" aria-label="Rotate front face clockwise">F</button>
                            <button class="control-btn" data-move="F'" aria-label="Rotate front face counterclockwise">F'</button>
                            <button class="control-btn" data-move="B" aria-label="Rotate back face clockwise">B</button>
                            <button class="control-btn" data-move="B'" aria-label="Rotate back face counterclockwise">B'</button>
                        </div>
                    </div>
                    <div class="action-controls">
                        <button class="action-btn shuffle" id="shuffle-btn" aria-label="Shuffle the cube">🔀 Shuffle</button>
                        <button class="action-btn solve" id="solve-btn" aria-label="Solve the cube">✅ Solve</button>
                        <button class="action-btn reset" id="reset-btn" aria-label="Reset the cube">🔄 Reset</button>
                    </div>
                </div>
                <div class="game-info">
                    <div class="info-item"><span class="info-label">Moves:</span><span class="info-value" id="move-count">0</span></div>
                    <div class="info-item"><span class="info-label">Status:</span><span class="info-value" id="game-status">Solved</span></div>
                </div>
                <div class="game-instructions">
                    <p><strong>How to play:</strong></p>
                    <p>• Click buttons or use keyboard: <span class="key-hint">U</span> <span class="key-hint">D</span> <span class="key-hint">L</span> <span class="key-hint">R</span> <span class="key-hint">F</span> <span class="key-hint">B</span></p>
                    <p>• Add <span class="key-hint">Shift</span> for counterclockwise moves</p>
                    <p>• Click and drag to rotate the view</p>
                </div>
            </div>
        `;

        // Replace placeholder with game container
        placeholder.parentNode.replaceChild(gameContainer, placeholder);

        // Initialize Three.js scene
        initThreeJSScene();
        initEventListeners();
        
        // Start animation loop
        animate();
        
        // Auto-shuffle after a brief delay
        setTimeout(() => {
            shuffleCube();
        }, 1000);
    }

    function initThreeJSScene() {
        const container = document.getElementById('threejs-scene');
        if (!container) {
            console.error('Three.js scene container not found');
            showNotification('Cube game container not found.', 'error');
            return;
        }

        // Ensure container has dimensions
        container.style.width = '100%';
        container.style.height = '400px';

        // Reset game state
        cubeGame = {
            isActive: true,
            scene: null,
            camera: null,
            renderer: null,
            cubeGroup: null,
            cubies: [],
            moves: 0,
            isSolved: true,
            isAnimating: false,
            isDragging: false,
            currentRotation: { x: -Math.PI/6, y: -Math.PI/4 }
        };

        // Create Three.js scene
        cubeGame.scene = new THREE.Scene();
        cubeGame.scene.background = new THREE.Color(0x1a1a2e);

        // Create camera
        cubeGame.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        cubeGame.camera.position.set(4, 4, 4);
        cubeGame.camera.lookAt(0, 0, 0);

        // Create renderer
        cubeGame.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        cubeGame.renderer.setSize(container.clientWidth, container.clientHeight);
        cubeGame.renderer.setPixelRatio(window.devicePixelRatio);
        cubeGame.renderer.setClearColor(0x000000, 0);
        cubeGame.renderer.shadowMap.enabled = true;
        cubeGame.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(cubeGame.renderer.domElement);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        cubeGame.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        cubeGame.scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(-5, -5, -5);
        cubeGame.scene.add(backLight);

        const sideLight = new THREE.DirectionalLight(0xffffff, 0.4);
        sideLight.position.set(0, 5, 0);
        cubeGame.scene.add(sideLight);

        // Create cube group
        cubeGame.cubeGroup = new THREE.Group();
        cubeGame.scene.add(cubeGame.cubeGroup);

        // Create 8 cubies (2x2x2)
        const cubeSize = 0.9;
        const gap = 0.05;

        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                for (let z = 0; z < 2; z++) {
                    createCubie(x, y, z, cubeSize, gap);
                }
            }
        }

        // Position camera
        updateCameraPosition();

        // Force initial render
        cubeGame.renderer.render(cubeGame.scene, cubeGame.camera);

        console.log('Three.js scene initialized with', cubeGame.cubies.length, 'cubies');
    }

    function createCubie(x, y, z, cubeSize, gap) {
        const group = new THREE.Group();
        group.position.set(
            (x - 0.5) * (cubeSize + gap),
            (y - 0.5) * (cubeSize + gap),
            (z - 0.5) * (cubeSize + gap)
        );

        group.userData = {
            originalPosition: new THREE.Vector3(x, y, z),
            currentPosition: new THREE.Vector3(x, y, z),
            isAnimating: false
        };

        const faceData = [
            { normal: [0, 0, 1], color: z === 1 ? CUBE_COLORS.front : null, position: [0, 0, cubeSize/2], rotation: [0, 0, 0] },
            { normal: [0, 0, -1], color: z === 0 ? CUBE_COLORS.back : null, position: [0, 0, -cubeSize/2], rotation: [0, Math.PI, 0] },
            { normal: [1, 0, 0], color: x === 1 ? CUBE_COLORS.right : null, position: [cubeSize/2, 0, 0], rotation: [0, Math.PI/2, 0] },
            { normal: [-1, 0, 0], color: x === 0 ? CUBE_COLORS.left : null, position: [-cubeSize/2, 0, 0], rotation: [0, -Math.PI/2, 0] },
            { normal: [0, 1, 0], color: y === 1 ? CUBE_COLORS.top : null, position: [0, cubeSize/2, 0], rotation: [-Math.PI/2, 0, 0] },
            { normal: [0, -1, 0], color: y === 0 ? CUBE_COLORS.bottom : null, position: [0, -cubeSize/2, 0], rotation: [Math.PI/2, 0, 0] }
        ];

        faceData.forEach(face => {
            if (face.color !== null) {
                const geometry = new THREE.PlaneGeometry(cubeSize * 0.95, cubeSize * 0.95);
                const material = new THREE.MeshLambertMaterial({ 
                    color: face.color,
                    transparent: false,
                    opacity: 1.0
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.fromArray(face.position);
                mesh.rotation.fromArray(face.rotation);
                mesh.userData = {
                    isFace: true,
                    faceNormal: new THREE.Vector3().fromArray(face.normal),
                    parentCubie: group,
                    faceColor: face.color,
                    origFaceColor: face.color
                };
                group.add(mesh);
            }
        });

        const wireframeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000,
            linewidth: 1,
            transparent: true,
            opacity: 0.8
        });
        const wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(wireframeGeometry),
            wireframeMaterial
        );
        group.add(wireframe);

        cubeGame.cubeGroup.add(group);
        cubeGame.cubies.push(group);
    }

    function performCubeMove(moveType, countMove = true) {
        if (cubeGame.isAnimating || !cubeGame.isActive) return;
        cubeGame.isAnimating = true;

        if (countMove) {
            cubeGame.moves++;
            updateGameDisplay();
        }

        const moves = {
            'U':  { axis: 'y', layer: 1, angle: -Math.PI/2, affected: (cubie) => cubie.userData.currentPosition.y === 1 },
            'D':  { axis: 'y', layer: 0, angle: Math.PI/2,  affected: (cubie) => cubie.userData.currentPosition.y === 0 },
            'L':  { axis: 'x', layer: 0, angle: -Math.PI/2, affected: (cubie) => cubie.userData.currentPosition.x === 0 },
            'R':  { axis: 'x', layer: 1, angle: Math.PI/2,  affected: (cubie) => cubie.userData.currentPosition.x === 1 },
            'F':  { axis: 'z', layer: 1, angle: -Math.PI/2, affected: (cubie) => cubie.userData.currentPosition.z === 1 },
            'B':  { axis: 'z', layer: 0, angle: Math.PI/2,  affected: (cubie) => cubie.userData.currentPosition.z === 0 },
            "U'": { axis: 'y', layer: 1, angle: Math.PI/2,  affected: (cubie) => cubie.userData.currentPosition.y === 1 },
            "D'": { axis: 'y', layer: 0, angle: -Math.PI/2, affected: (cubie) => cubie.userData.currentPosition.y === 0 },
            "L'": { axis: 'x', layer: 0, angle: Math.PI/2,  affected: (cubie) => cubie.userData.currentPosition.x === 0 },
            "R'": { axis: 'x', layer: 1, angle: -Math.PI/2, affected: (cubie) => cubie.userData.currentPosition.x === 1 },
            "F'": { axis: 'z', layer: 1, angle: Math.PI/2,  affected: (cubie) => cubie.userData.currentPosition.z === 1 },
            "B'": { axis: 'z', layer: 0, angle: -Math.PI/2, affected: (cubie) => cubie.userData.currentPosition.z === 0 }
        };

        const move = moves[moveType];
        if (!move) {
            console.error('Invalid move:', moveType);
            cubeGame.isAnimating = false;
            return;
        }

        console.log(`Performing move: ${moveType}`);

        const affectedCubies = cubeGame.cubies.filter(move.affected);
        const rotationGroup = new THREE.Group();
        const center = new THREE.Vector3();

        affectedCubies.forEach(cubie => {
            center.add(cubie.position);
        });
        center.divideScalar(affectedCubies.length);
        rotationGroup.position.copy(center);

        affectedCubies.forEach(cubie => {
            const worldPos = cubie.getWorldPosition(new THREE.Vector3());
            cubie.position.copy(worldPos.sub(rotationGroup.position));
            cubeGame.cubeGroup.remove(cubie);
            rotationGroup.add(cubie);
        });

        cubeGame.scene.add(rotationGroup);

        const duration = 400;
        const startTime = Date.now();
        const targetAngle = move.angle;

        function animateRotation() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentAngle = targetAngle * easedProgress;

            rotationGroup.rotation[move.axis] = currentAngle;

            if (progress < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                finishRotation(rotationGroup, move.axis, move.layer, targetAngle > 0);
            }
        }

        animateRotation();
    }

    function finishRotation(rotationGroup, axis, layer, clockwise) {
        updateCubiePositions(axis, layer, clockwise);

        const quaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0),
            clockwise ? Math.PI/2 : -Math.PI/2
        );

        while (rotationGroup.children.length > 0) {
            const cubie = rotationGroup.children[0];
            const localPos = cubie.position.clone();
            cubie.quaternion.multiplyQuaternions(quaternion, cubie.quaternion);
            rotationGroup.remove(cubie);
            cubeGame.cubeGroup.add(cubie);
            cubie.position.copy(localPos).add(rotationGroup.position);
        }

        cubeGame.scene.remove(rotationGroup);
        cubeGame.isAnimating = false;
        checkIfSolved();
        updateGameDisplay();

        if (cubeGame.isSolved) {
            showNotification('🎉 Cube Solved! Great job!', 'success');
        }
    }

    function updateCubiePositions(axis, layer, clockwise) {
        const cubeSize = 0.9;
        const gap = 0.05;

        cubeGame.cubies.forEach(cubie => {
            if (isCubieInLayer(cubie, axis, layer)) {
                const pos = cubie.userData.currentPosition.clone();
                let newPos;

                if (axis === 'x') {
                    newPos = clockwise ? new THREE.Vector3(pos.x, pos.z, 1 - pos.y) : new THREE.Vector3(pos.x, 1 - pos.z, pos.y);
                } else if (axis === 'y') {
                    newPos = clockwise ? new THREE.Vector3(1 - pos.z, pos.y, pos.x) : new THREE.Vector3(pos.z, pos.y, 1 - pos.x);
                } else if (axis === 'z') {
                    newPos = clockwise ? new THREE.Vector3(1 - pos.y, pos.x, pos.z) : new THREE.Vector3(pos.y, 1 - pos.x, pos.z);
                }

                cubie.userData.currentPosition.copy(newPos);
                cubie.position.set(
                    (newPos.x - 0.5) * (cubeSize + gap),
                    (newPos.y - 0.5) * (cubeSize + gap),
                    (newPos.z - 0.5) * (cubeSize + gap)
                );
            }
        });
    }

    function isCubieInLayer(cubie, axis, layer) {
        const pos = cubie.userData.currentPosition;
        switch(axis) {
            case 'x': return pos.x === layer;
            case 'y': return pos.y === layer;
            case 'z': return pos.z === layer;
        }
        return false;
    }

    function checkIfSolved() {
        let solved = true;
        const sides = {
            front: { normal: new THREE.Vector3(0, 0, 1), color: CUBE_COLORS.front, layer: 1, axis: 'z' },
            back: { normal: new THREE.Vector3(0, 0, -1), color: CUBE_COLORS.back, layer: 0, axis: 'z' },
            right: { normal: new THREE.Vector3(1, 0, 0), color: CUBE_COLORS.right, layer: 1, axis: 'x' },
            left: { normal: new THREE.Vector3(-1, 0, 0), color: CUBE_COLORS.left, layer: 0, axis: 'x' },
            top: { normal: new THREE.Vector3(0, 1, 0), color: CUBE_COLORS.top, layer: 1, axis: 'y' },
            bottom: { normal: new THREE.Vector3(0, -1, 0), color: CUBE_COLORS.bottom, layer: 0, axis: 'y' }
        };

        for (const sideKey in sides) {
            const side = sides[sideKey];
            const faceColors = [];

            cubeGame.cubies.forEach(cubie => {
                if (isCubieInLayer(cubie, side.axis, side.layer)) {
                    let matchingColor = null;
                    cubie.children.forEach(child => {
                        if (child.userData.isFace) {
                            const localNormal = child.userData.faceNormal.clone();
                            const worldNormal = localNormal.applyQuaternion(cubie.quaternion);
                            if (worldNormal.distanceTo(side.normal) < 0.1) {
                                matchingColor = child.userData.faceColor;
                            }
                        }
                    });
                    if (matchingColor !== null) {
                        faceColors.push(matchingColor);
                    } else {
                        solved = false;
                        return;
                    }
                }
            });

            if (faceColors.length !== 4 || !faceColors.every(c => c === side.color)) {
                solved = false;
            }
        }

        cubeGame.isSolved = solved;
        console.log('Solved check:', { solved: cubeGame.isSolved });
    }

    function shuffleCube() {
        if (cubeGame.isAnimating) return;

        const moves = ['U', 'U\'', 'D', 'D\'', 'L', 'L\'', 'R', 'R\'', 'F', 'F\'', 'B', 'B\''];
        const shuffleCount = 20;
        let movesDone = 0;

        function doShuffleMove() {
            if (movesDone >= shuffleCount) {
                cubeGame.moves = 0;
                cubeGame.isSolved = false;
                updateGameDisplay();
                showNotification('Cube shuffled! Try to solve it.', 'info');
                return;
            }

            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            performCubeMove(randomMove, false);
            movesDone++;
            setTimeout(doShuffleMove, 150);
        }

        doShuffleMove();
    }

    function solveCube() {
        if (cubeGame.isAnimating || cubeGame.isSolved) return;
        cubeGame.isAnimating = true;

        cubeGame.cubies.forEach(cubie => {
            const originalPos = cubie.userData.originalPosition;
            cubie.userData.currentPosition.copy(originalPos);

            const targetPosition = new THREE.Vector3(
                (originalPos.x - 0.5) * (0.9 + 0.05),
                (originalPos.y - 0.5) * (0.9 + 0.05),
                (originalPos.z - 0.5) * (0.9 + 0.05)
            );

            const startPosition = cubie.position.clone();
            const startQuaternion = cubie.quaternion.clone();
            const targetQuaternion = new THREE.Quaternion();

            const duration = 800;
            const startTime = Date.now();

            function animateToSolved() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);

                cubie.position.lerpVectors(startPosition, targetPosition, easedProgress);
                cubie.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, easedProgress);

                if (progress < 1) {
                    requestAnimationFrame(animateToSolved);
                } else {
                    cubie.position.copy(targetPosition);
                    cubie.quaternion.copy(targetQuaternion);
                }
            }

            animateToSolved();
        });

        setTimeout(() => {
            cubeGame.moves = 0;
            cubeGame.isSolved = true;
            cubeGame.isAnimating = false;
            updateGameDisplay();
            showNotification('Cube solved!', 'success');
        }, 850);
    }

    function resetCube() {
        if (cubeGame.isAnimating) return;
        cleanupCubeGame();
        initThreeJSScene();
        cubeGame.moves = 0;
        cubeGame.isSolved = true;
        updateGameDisplay();
        showNotification('Cube reset to solved state.', 'info');
        setTimeout(shuffleCube, 1000);
    }

    function updateGameDisplay() {
        const moveCount = document.getElementById('move-count');
        const gameStatus = document.getElementById('game-status');

        if (moveCount) moveCount.textContent = cubeGame.moves;
        if (gameStatus) {
            gameStatus.textContent = cubeGame.isSolved ? 'Solved! 🎉' : 'Unsolved';
            gameStatus.className = `info-value ${cubeGame.isSolved ? 'solved' : 'unsolved'}`;
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cube-notification ${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        `;
        document.body.appendChild(notification);

        // Notification styles
        if (!document.querySelector('#cube-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'cube-notification-styles';
            styles.textContent = `
                .cube-notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: rgba(255,255,255,0.95);
                    color: #333;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    max-width: 300px;
                    animation: slideInRight 0.3s ease-out;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .cube-notification.success { background: rgba(76,175,80,0.95); color: white; }
                .cube-notification.info { background: rgba(33,150,243,0.95); color: white; }
                .cube-notification.error { background: rgba(255,99,71,0.95); color: white; }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .notification-close:hover { background: rgba(255,255,255,0.2); }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        });
    }

    function updateCameraPosition() {
        const radius = 6;
        const x = radius * Math.cos(cubeGame.currentRotation.y) * Math.cos(cubeGame.currentRotation.x);
        const y = radius * Math.sin(cubeGame.currentRotation.x);
        const z = radius * Math.sin(cubeGame.currentRotation.y) * Math.cos(cubeGame.currentRotation.x);
        cubeGame.camera.position.set(x, y, z);
        cubeGame.camera.lookAt(0, 0, 0);
    }

    function animate() {
        if (!cubeGame.isActive) return;
        requestAnimationFrame(animate);
        if (cubeGame.renderer && cubeGame.scene && cubeGame.camera) {
            cubeGame.renderer.render(cubeGame.scene, cubeGame.camera);
        }
    }

    function cleanupCubeGame() {
        if (cubeGame.renderer) {
            cubeGame.renderer.dispose();
            const container = document.getElementById('threejs-scene');
            if (container && cubeGame.renderer.domElement) {
                container.removeChild(cubeGame.renderer.domElement);
            }
        }
        cubeGame.isActive = false;
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('mouseup', mouseupHandler);
        document.removeEventListener('touchmove', touchmoveHandler);
        document.removeEventListener('touchend', touchendHandler);
        window.removeEventListener('resize', resizeHandler);
    }

    let keydownHandler, mousemoveHandler, mouseupHandler, touchmoveHandler, touchendHandler, resizeHandler;

    function initEventListeners() {
        console.log('Initializing event listeners...');

        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const move = e.target.getAttribute('data-move');
                if (move) performCubeMove(move);
            });
        });

        document.getElementById('shuffle-btn')?.addEventListener('click', shuffleCube);
        document.getElementById('solve-btn')?.addEventListener('click', solveCube);
        document.getElementById('reset-btn')?.addEventListener('click', resetCube);

        keydownHandler = (e) => {
            if (cubeGame.isAnimating || !cubeGame.isActive) return;
            const key = e.key.toUpperCase();
            const isShift = e.shiftKey;
            const keyMappings = {
                'U': isShift ? "U'" : 'U',
                'D': isShift ? "D'" : 'D',
                'L': isShift ? "L'" : 'L',
                'R': isShift ? "R'" : 'R',
                'F': isShift ? "F'" : 'F',
                'B': isShift ? "B'" : 'B'
            };
            if (keyMappings[key]) {
                e.preventDefault();
                performCubeMove(keyMappings[key]);
            }
        };
        document.addEventListener('keydown', keydownHandler);

        const sceneElement = document.getElementById('threejs-scene');
        if (sceneElement) {
            let isDragging = false;
            let lastMouseX = 0;
            let lastMouseY = 0;

            sceneElement.addEventListener('mousedown', (e) => {
                isDragging = true;
                cubeGame.isDragging = true;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                sceneElement.style.cursor = 'grabbing';
            });

            mousemoveHandler = (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                cubeGame.currentRotation.y += deltaX * 0.01;
                cubeGame.currentRotation.x += deltaY * 0.01;
                cubeGame.currentRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, cubeGame.currentRotation.x));
                updateCameraPosition();
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            };
            document.addEventListener('mousemove', mousemoveHandler);

            mouseupHandler = () => {
                isDragging = false;
                cubeGame.isDragging = false;
                sceneElement.style.cursor = 'grab';
            };
            document.addEventListener('mouseup', mouseupHandler);

            sceneElement.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    isDragging = true;
                    cubeGame.isDragging = true;
                    lastMouseX = e.touches[0].clientX;
                    lastMouseY = e.touches[0].clientY;
                    e.preventDefault();
                }
            });

            touchmoveHandler = (e) => {
                if (!isDragging || e.touches.length !== 1) return;
                const deltaX = e.touches[0].clientX - lastMouseX;
                const deltaY = e.touches[0].clientY - lastMouseY;
                cubeGame.currentRotation.y += deltaX * 0.01;
                cubeGame.currentRotation.x += deltaY * 0.01;
                cubeGame.currentRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, cubeGame.currentRotation.x));
                updateCameraPosition();
                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
                e.preventDefault();
            };
            document.addEventListener('touchmove', touchmoveHandler);

            touchendHandler = () => {
                isDragging = false;
                cubeGame.isDragging = false;
            };
            document.addEventListener('touchend', touchendHandler);

            sceneElement.style.cursor = 'grab';
        }

        resizeHandler = () => {
            const container = document.getElementById('threejs-scene');
            if (container && cubeGame.camera && cubeGame.renderer) {
                cubeGame.camera.aspect = container.clientWidth / container.clientHeight;
                cubeGame.camera.updateProjectionMatrix();
                cubeGame.renderer.setSize(container.clientWidth, container.clientHeight);
                cubeGame.renderer.render(cubeGame.scene, cubeGame.camera);
            }
        };
        window.addEventListener('resize', resizeHandler);

        console.log('Event listeners initialized');
    }

    window.initCubeGame = initCubeGame;

    let initAttempts = 0;
    const maxAttempts = 50;

    function tryInit() {
        if (initAttempts >= maxAttempts) {
            console.error('Max initialization attempts reached');
            showNotification('Failed to initialize cube game. Please refresh the page.', 'error');
            return;
        }

        if (typeof THREE !== 'undefined' && document.getElementById('cube-game-placeholder')) {
            initCubeGame();
        } else {
            console.warn('Waiting for dependencies or DOM elements... Attempt', initAttempts + 1);
            initAttempts++;
            setTimeout(tryInit, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
})();
/* Combined page scripts for index, end, emptiness, silence, stillness.
	 This file centralizes all inline scripts previously embedded in the HTML
	 files. Each initializer checks for the presence of the DOM element it
	 needs so the same script can be safely included on every page.
*/
(function () {
	'use strict';

	function onLoad(fn) {
		if (document.readyState === 'loading') window.addEventListener('load', fn);
		else fn();
	}

	// ----------------------------- Index (Paint Blobs) -----------------------------
	function initPaintBlobs() {
		const interactiveBg = document.getElementById('interactive-bg');
		if (!interactiveBg) return;

		let paintBlobs = [];
		let isMouseDown = false;

		function createPaintBlobs() {
			const blobCount = 12;
			const colors = [
				'rgba(255, 100, 100, 0.8)',
				'rgba(100, 200, 255, 0.8)',
				'rgba(100, 255, 150, 0.8)',
				'rgba(255, 200, 100, 0.8)',
				'rgba(200, 100, 255, 0.8)',
				'rgba(255, 255, 100, 0.8)'
			];

			for (let i = 0; i < blobCount; i++) {
				const blob = document.createElement('div');
				blob.className = 'paint-blob';

				const size = Math.random() * 300 + 150;
				blob.style.width = `${size}px`;
				blob.style.height = `${size}px`;

				const color = colors[Math.floor(Math.random() * colors.length)];
				blob.style.backgroundColor = color;

				blob.style.left = `${Math.random() * 100}%`;
				blob.style.top = `${Math.random() * 100}%`;

				interactiveBg.appendChild(blob);
				paintBlobs.push({
					element: blob,
					x: Math.random() * 100,
					y: Math.random() * 100,
					vx: (Math.random() - 0.5) * 0.05,
					vy: (Math.random() - 0.5) * 0.05,
					size: size,
					color: color
				});
			}
		}

		function animatePaintBlobs() {
			paintBlobs.forEach(blob => {
				blob.x += blob.vx;
				blob.y += blob.vy;

				if (blob.x < -20 || blob.x > 120) blob.vx *= -1;
				if (blob.y < -20 || blob.y > 120) blob.vy *= -1;

				blob.element.style.left = `${blob.x}%`;
				blob.element.style.top = `${blob.y}%`;
			});

			requestAnimationFrame(animatePaintBlobs);
		}

		function createPaintAtPosition(x, y) {
			const blob = document.createElement('div');
			blob.className = 'paint-blob';

			const size = Math.random() * 200 + 100;
			blob.style.width = `${size}px`;
			blob.style.height = `${size}px`;

			const colors = [
				'rgba(255, 100, 100, 0.8)',
				'rgba(100, 200, 255, 0.8)',
				'rgba(100, 255, 150, 0.8)',
				'rgba(255, 200, 100, 0.8)',
				'rgba(200, 100, 255, 0.8)',
				'rgba(255, 255, 100, 0.8)'
			];
			const color = colors[Math.floor(Math.random() * colors.length)];
			blob.style.backgroundColor = color;

			const xPercent = (x / window.innerWidth) * 100;
			const yPercent = (y / window.innerHeight) * 100;

			blob.style.left = `${xPercent}%`;
			blob.style.top = `${yPercent}%`;

			interactiveBg.appendChild(blob);

			const newBlob = {
				element: blob,
				x: xPercent,
				y: yPercent,
				vx: (Math.random() - 0.5) * 0.1,
				vy: (Math.random() - 0.5) * 0.1,
				size: size,
				color: color
			};

			paintBlobs.push(newBlob);

			setTimeout(() => {
				const index = paintBlobs.indexOf(newBlob);
				if (index > -1) {
					paintBlobs.splice(index, 1);
					blob.remove();
				}
			}, 10000);
		}

		// Event handlers scoped to this feature
		function mouseMoveHandler(e) {
			const mouseX = e.clientX / window.innerWidth;
			const mouseY = e.clientY / window.innerHeight;

			paintBlobs.forEach(blob => {
				const dx = blob.x / 100 - mouseX;
				const dy = blob.y / 100 - mouseY;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 0.3) {
					blob.vx += dx * 0.01;
					blob.vy += dy * 0.01;
				}
			});
		}

		function clickHandler(e) { createPaintAtPosition(e.clientX, e.clientY); }
		function downHandler(e) { isMouseDown = true; createPaintAtPosition(e.clientX, e.clientY); }
		function dragHandler(e) { if (isMouseDown) createPaintAtPosition(e.clientX, e.clientY); }
		function upHandler() { isMouseDown = false; }

		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('click', clickHandler);
		document.addEventListener('mousedown', downHandler);
		document.addEventListener('mousemove', dragHandler);
		document.addEventListener('mouseup', upHandler);

		createPaintBlobs();
		animatePaintBlobs();
	}

	// ----------------------------- End (Binary Rain) -----------------------------
	function initBinaryRain() {
		const binaryRain = document.getElementById('binary-rain');
		if (!binaryRain) return;

		let binaryDigits = [];

		const intervalId = setInterval(() => {
			const digit = document.createElement('div');
			digit.className = 'binary-digit';
			digit.textContent = Math.random() > 0.5 ? '1' : '0';

			digit.style.left = `${Math.random() * 100}%`;
			digit.style.fontSize = `${Math.random() * 20 + 10}px`;
			digit.style.animationDuration = `${Math.random() * 5 + 3}s`;
			digit.style.color = `rgba(0, 255, 170, ${Math.random() * 0.5 + 0.3})`;

			binaryRain.appendChild(digit);
			binaryDigits.push(digit);

			if (binaryDigits.length > 100) {
				const oldDigit = binaryDigits.shift();
				if (oldDigit.parentNode) oldDigit.parentNode.removeChild(oldDigit);
			}
		}, 100);

		// store interval id so it could be cleared later if needed
		binaryRain.__binaryInterval = intervalId;
	}

	// ----------------------------- Emptiness (Grid System) -----------------------------
	function initGridSystem() {
		const gridSystem = document.getElementById('grid-system');
		if (!gridSystem) return;

		let gridLines = [];

		function createGrid() {
			const gridSize = 50;
			const width = window.innerWidth;
			const height = window.innerHeight;

			gridSystem.innerHTML = '';
			gridLines = [];

			for (let x = 0; x < width; x += gridSize) {
				const line = document.createElement('div');
				line.className = 'grid-line vertical';
				line.style.left = `${x}px`;
				gridSystem.appendChild(line);
				gridLines.push(line);
			}

			for (let y = 0; y < height; y += gridSize) {
				const line = document.createElement('div');
				line.className = 'grid-line horizontal';
				line.style.top = `${y}px`;
				gridSystem.appendChild(line);
				gridLines.push(line);
			}
		}

		function mouseMoveGridHandler(e) {
			const mouseX = e.clientX;
			const mouseY = e.clientY;

			gridLines.forEach(line => {
				const rect = line.getBoundingClientRect();
				let distance;

				if (line.classList.contains('vertical')) distance = Math.abs(rect.left - mouseX);
				else distance = Math.abs(rect.top - mouseY);

				if (distance < 100) {
					const intensity = 1 - (distance / 100);
					line.style.backgroundColor = `rgba(255, 255, 255, ${0.03 + intensity * 0.1})`;
				} else {
					line.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
				}
			});
		}

		window.addEventListener('resize', createGrid);
		document.addEventListener('mousemove', mouseMoveGridHandler);

		createGrid();
	}

	// ----------------------------- Silence (Wave Canvas) -----------------------------
	function initWaveCanvas() {
		const waveCanvas = document.getElementById('wave-canvas');
		if (!waveCanvas) return;

		const ctx = waveCanvas.getContext('2d');

		function setupWaveCanvas() {
			waveCanvas.width = window.innerWidth;
			waveCanvas.height = window.innerHeight;
		}

		function drawWaves() {
			ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

			const time = Date.now() * 0.001;
			const centerY = waveCanvas.height / 2;

			for (let layer = 0; layer < 3; layer++) {
				ctx.beginPath();
				ctx.moveTo(0, centerY);

				for (let x = 0; x < waveCanvas.width; x += 2) {
					const frequency = 0.01 + layer * 0.005;
					const amplitude = 30 - layer * 10;
					const speed = time * (1 + layer * 0.5);

					const y = centerY +
						Math.sin(x * frequency + speed) * amplitude +
						Math.sin(x * frequency * 2 + speed * 1.7) * (amplitude * 0.3);

					ctx.lineTo(x, y);
				}

				const alpha = 0.4 - layer * 0.1;
				ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
				ctx.lineWidth = 2 - layer * 0.5;
				ctx.stroke();
			}

			requestAnimationFrame(drawWaves);
		}

		window.addEventListener('resize', setupWaveCanvas);
		setupWaveCanvas();
		drawWaves();
	}

	// ----------------------------- Stillness (Color Flow) -----------------------------
	function initColorFlow() {
		const colorFlow = document.getElementById('color-flow');
		if (!colorFlow) return;

		let flowParticles = [];

		function createFlowParticles() {
			const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9ff3', '#54a0ff', '#5f27cd'];

			for (let i = 0; i < 40; i++) {
				const particle = document.createElement('div');
				particle.className = 'flow-particle';

				const size = Math.random() * 100 + 50;
				particle.style.width = `${size}px`;
				particle.style.height = `${size}px`;

				const color = colors[Math.floor(Math.random() * colors.length)];
				particle.style.backgroundColor = color;

				particle.style.left = `${Math.random() * 100}%`;
				particle.style.top = `${Math.random() * 100}%`;

				colorFlow.appendChild(particle);
				flowParticles.push({
					element: particle,
					x: Math.random() * 100,
					y: Math.random() * 100,
					vx: (Math.random() - 0.5) * 0.1,
					vy: (Math.random() - 0.5) * 0.1
				});
			}
		}

		function animateFlowParticles() {
			flowParticles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;

				if (p.x < -10 || p.x > 110) p.vx *= -1;
				if (p.y < -10 || p.y > 110) p.vy *= -1;

				p.element.style.left = `${p.x}%`;
				p.element.style.top = `${p.y}%`;
			});

			requestAnimationFrame(animateFlowParticles);
		}

		function flowMouseHandler(e) {
			const mouseX = e.clientX / window.innerWidth;
			const mouseY = e.clientY / window.innerHeight;

			flowParticles.forEach(p => {
				const dx = p.x / 100 - mouseX;
				const dy = p.y / 100 - mouseY;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 0.2) {
					p.vx -= dx * 0.1;
					p.vy -= dy * 0.1;
				}
			});
		}

		document.addEventListener('mousemove', flowMouseHandler);

		createFlowParticles();
		animateFlowParticles();
	}

	// Initialize features only if their target elements exist
	onLoad(() => {
		initPaintBlobs();
		initBinaryRain();
		initGridSystem();
		initWaveCanvas();
		initColorFlow();
	});

})();


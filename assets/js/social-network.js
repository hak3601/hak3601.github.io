/* A small, dependency-free 3D network illustration for the page background. */
(function () {
  const canvas = document.querySelector(".social-network-background");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0, active: false };
  const nodes = [];
  let animationFrame;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let rotation = 0;

  const nodeCount = () => Math.min(76, Math.max(34, Math.round((width * height) / 18000)));

  function createNodes() {
    nodes.length = 0;
    for (let index = 0; index < nodeCount(); index += 1) {
      nodes.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1,
        size: Math.random() * 2.2 + 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createNodes();
    if (reducedMotion.matches) draw();
  }

  function draw() {
    const isDark = document.documentElement.dataset.theme === "dark";
    const color = isDark ? "91, 141, 239" : "37, 99, 235";
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.52;
    const projected = nodes.map((node) => {
      const depth = node.z * 0.12;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rotatedX = node.x * cos - node.z * sin;
      const rotatedZ = node.x * sin + node.z * cos;
      const perspective = 1 / (1.8 - rotatedZ * 0.35);
      return {
        x: centerX + rotatedX * scale * perspective,
        y: centerY + (node.y + depth) * scale * perspective,
        z: rotatedZ,
        size: node.size * perspective,
      };
    });

    context.clearRect(0, 0, width, height);
    context.lineWidth = 0.8;
    for (let first = 0; first < projected.length; first += 1) {
      for (let second = first + 1; second < projected.length; second += 1) {
        const a = projected[first];
        const b = projected[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > Math.min(width, height) * 0.23) continue;
        context.strokeStyle = `rgba(${color}, ${Math.max(0.04, 0.18 - distance / (Math.min(width, height) * 1.8))})`;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }

    projected.forEach((node) => {
      context.fillStyle = `rgba(${color}, ${Math.max(0.2, 0.35 + node.z * 0.2)})`;
      context.beginPath();
      context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      context.fill();
    });
  }

  function animate(time) {
    const pointerRotation = pointer.active ? pointer.x * 0.08 : 0;
    rotation = reducedMotion.matches ? 0 : time * 0.00008 + pointerRotation;
    draw();
    if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
  }

  function updatePointer(event) {
    pointer.x = event.clientX / width - 0.5;
    pointer.y = event.clientY / height - 0.5;
    pointer.active = true;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", updatePointer, { passive: true });
  reducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(animationFrame);
    animate(performance.now());
  });

  resize();
  animate(performance.now());
}());

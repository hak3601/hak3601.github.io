/* A small, dependency-free 3D network illustration for the page background. */
(function () {
  const canvas = document.querySelector(".social-network-background");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0, screenX: 0, screenY: 0, active: false, dragging: false };
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

  function draw(time = 0) {
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

    if (pointer.active) {
      const nearest = projected
        .map((node) => ({ node, distance: Math.hypot(node.x - pointer.screenX, node.y - pointer.screenY) }))
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 3);

      if (pointer.dragging) {
        context.setLineDash([5, 7]);
        context.lineDashOffset = -time * 0.03;
        context.lineWidth = 1.4;
        nearest.forEach(({ node, distance }) => {
          if (distance > Math.min(width, height) * 0.27) return;
          context.strokeStyle = `rgba(${color}, ${Math.max(0.18, 0.58 - distance / (Math.min(width, height) * 0.7))})`;
          context.beginPath();
          context.moveTo(pointer.screenX, pointer.screenY);
          context.lineTo(node.x, node.y);
          context.stroke();
        });
        context.setLineDash([]);
        context.lineDashOffset = 0;
      }

      context.fillStyle = `rgba(${color}, 0.95)`;
      context.shadowColor = `rgba(${color}, 0.8)`;
      context.shadowBlur = pointer.dragging ? 18 : 11;
      context.beginPath();
      context.arc(pointer.screenX, pointer.screenY, pointer.dragging ? 5.5 : 4, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    }
  }

  function animate(time) {
    const pointerRotation = pointer.active ? pointer.x * 0.08 : 0;
    rotation = reducedMotion.matches ? 0 : time * 0.00008 + pointerRotation;
    draw(time);
    if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
  }

  function updatePointer(event) {
    pointer.x = event.clientX / width - 0.5;
    pointer.y = event.clientY / height - 0.5;
    pointer.screenX = event.clientX;
    pointer.screenY = event.clientY;
    pointer.active = true;
    if (reducedMotion.matches) draw(performance.now());
  }

  function startDragging(event) {
    updatePointer(event);
    pointer.dragging = true;
  }

  function stopDragging() {
    pointer.dragging = false;
    if (reducedMotion.matches) draw(performance.now());
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerdown", startDragging, { passive: true });
  window.addEventListener("pointerup", stopDragging, { passive: true });
  window.addEventListener("pointercancel", stopDragging, { passive: true });
  reducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(animationFrame);
    animate(performance.now());
  });

  resize();
  animate(performance.now());
}());

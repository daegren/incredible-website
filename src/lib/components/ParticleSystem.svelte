<script lang="ts" context="module">
  import * as Vector from "$lib/vector";
  import * as Point from "$lib/point";

  export let containerWidth: number;
  export let containerHeight: number;
  export let particleCount: number = 50;
  export let particleIcon: string;
  export let staticIcon: string = "/mary2.png";

  const STATIC_SIZE = 100; // Size of static particles in pixels

  interface Particle {
    position: Point.Point;
    size: number;
    direction: Vector.Vector;
    speed: number;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
    isStatic: boolean;
    originalSize: number;
    originalPosition: Point.Point;
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  export let containerWidth: number;
  export let containerHeight: number;
  export let particleCount = 2;
  export let particleIcon: string;
  export let staticIcon = "/mary2.png";

  const STATIC_SIZE = 100;
  const dispatch = createEventDispatcher();

  let particles: Particle[] = [];
  let gameWon = false;
  let animationFrame: number;
  let lastTime: number;

  $: if (containerWidth && containerHeight && particleIcon) {
    initParticles();
  }

  function createParticle(): Particle {
    const size = Math.random() * 35 + 25;
    const x = Math.random() * (containerWidth - size);
    const y = Math.random() * (containerHeight - size);
    return {
      position: Point.create(x, y),
      size,
      speed: 250,
      direction: Vector.create(Math.random() - 0.5, Math.random() - 0.5),
      opacity: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      isStatic: false,
      originalSize: size,
      originalPosition: Point.create(x, y),
    };
  }

  function initParticles() {
    particles = Array(particleCount).fill(null).map(createParticle);
    gameWon = false;
  }

  function updateParticles(delta: number) {
    if (gameWon) return;

    const deltaSeconds = delta / 1000;
    let staticParticleCount = 0;

    particles = particles.map((particle) => {
      if (particle.isStatic) {
        staticParticleCount += 1;
        return particle;
      }

      particle.position = Point.applyVector(
        Vector.scale(deltaSeconds * particle.speed, Vector.normalize(particle.direction)),
        particle.position
      );

      if (
        particle.position.x < 0 ||
        particle.position.x + particle.size > containerWidth
      ) {
        particle.direction = Vector.invertX(particle.direction);
        particle.position = Point.create(
          particle.position.x < 0 ? 0 : containerWidth - particle.size,
          particle.position.y
        );
      }
      if (
        particle.position.y < 0 ||
        particle.position.y + particle.size > containerHeight
      ) {
        particle.direction = Vector.invertY(particle.direction);
        particle.position = Point.create(
          particle.position.x,
          particle.position.y < 0 ? 0 : containerHeight - particle.size
        );
      }

      particle.rotation += particle.rotationSpeed * deltaSeconds * 60;
      particle.opacity = 0.5 + Math.sin(Date.now() / 1000) * 0.25;

      return particle;
    });

    if (staticParticleCount === particleCount) {
      gameWon = true;
      dispatch("gameWon");
    }
  }

  function toggleParticleState(index: number) {
    if (gameWon) return;

    const particle = particles[index];
    if (particle.isStatic) {
      // Change back to moving state
      particle.isStatic = false;
      particle.size = particle.originalSize;
      particle.position = particle.originalPosition;
    } else {
      // Change to static state
      particle.isStatic = true;
      particle.opacity = 1;
      particle.rotation = 0; // Remove rotatio

      // Store original position
      particle.originalPosition = particle.position;

      const sizeDiff = STATIC_SIZE - particle.size;
      particle.position = Point.create(
        particle.originalPosition.x - sizeDiff / 2,
        particle.originalPosition.y - sizeDiff / 2
      );

      // Ensure the particle stays within bounds
      particle.position = Point.create(
        Math.max(
          0,
          Math.min(particle.position.x, containerWidth - STATIC_SIZE)
        ),
        Math.max(
          0,
          Math.min(particle.position.y, containerHeight - STATIC_SIZE)
        )
      );

      particle.size = STATIC_SIZE;

      dispatch("particleClick");
    }
    particles = particles;
  }

  function animate(time: number) {
    if (lastTime) {
      const delta = time - lastTime;
      updateParticles(delta);
    }
    lastTime = time;
    animationFrame = requestAnimationFrame(animate);
  }

  onMount(() => {
    initParticles();
    animationFrame = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

{#if !gameWon}
  {#each particles as particle, i}
    <button
      on:click={() => toggleParticleState(i)}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleParticleState(i);
        }
      }}
      style="position: absolute; 
             left: {particle.position.x}px; 
             top: {particle.position.y}px; 
             width: {particle.size}px; 
             height: {particle.size}px; 
             opacity: {particle.opacity};
             transform: rotate({particle.isStatic ? 0 : particle.rotation}deg);
             cursor: pointer;
             background: none;
             border: none;
             padding: 0;
             transition: all 0.3s ease;"
      aria-label={particle.isStatic ? "Static particle" : "Moving particle"}
    >
      <img
        src={particle.isStatic ? staticIcon : particleIcon}
        alt=""
        style="width: 100%; height: 100%; object-fit: cover;"
      />
    </button>
  {/each}
{/if}

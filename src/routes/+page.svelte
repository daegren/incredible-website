<script lang="ts">
  import * as Vector from "$lib/vector";
  import * as Point from "$lib/point";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import SvelteSeo from "svelte-seo";
  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";
  import HeroBanner from "../lib/components/HeroBanner.svelte";
  import ParticleSystem from "../lib/components/ParticleSystem.svelte";

  // Constants
  const PARTICLE_ICON = "/chicken.png";
  const STATIC_ICON = "/mary2.png";
  const KINGSTON_ICON = "/kingston.png";
  const PARTICLE_COUNT = 25;

  // State variables
  let containerWidth = 1000;
  let containerHeight = 600;
  let imageWidth = 100;
  let imageHeight = 100;
  let image: HTMLImageElement;

  // Initialize both x and y with default values
  let position = Point.create(containerWidth / 2, containerHeight / 2);
  let direction = Vector.create(1, 1);
  const speed = 200;

  let gameWon = false;
  let heroText = "MARY CHOI";
  let timerStarted = false;
  let timerValue = 0;
  let clickedParticles = 0;
  let startTime: number;

  const scale = tweened(1, {
    duration: 2000,
    easing: cubicInOut,
  });

  // Functions
  function handleGameWon() {
    gameWon = true;
    heroText = "KINGSTON'S VALET";
    animateKingstonImage();
    stopTimer();
  }

  function animateKingstonImage() {
    const zoomIn = async () => {
      await scale.set(1.5, { duration: 1000 });
      zoomOut();
    };
    const zoomOut = async () => {
      await scale.set(1, { duration: 1000 });
      zoomIn();
    };
    zoomIn();
  }

  function handleImageLoad(): void {
    if (image) {
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      imageHeight = imageWidth / aspectRatio;

      // Initialize position to center of container
      position = Point.create(
        (containerWidth - imageWidth) / 2,
        (containerHeight - imageHeight) / 2
      );
    }
  }

  function updatePosition(delta: number): void {
    if (gameWon) return;

    const deltaSeconds = delta / 1000;

    position = Point.applyVector(
      Vector.scale(deltaSeconds * speed, Vector.normalize(direction)),
      position
    );

    if (position.x <= 0 || position.x + imageWidth >= containerWidth) {
      direction = Vector.invertX(direction);
      position = Point.create(
        position.x <= 0 ? 0 : containerWidth - imageWidth,
        position.y
      );
    }
    if (position.y <= 0 || position.y + imageHeight >= containerHeight) {
      direction = Vector.invertY(direction);
      position = Point.create(
        position.x,
        position.y <= 0 ? 0 : containerHeight - imageHeight
      );
    }
  }

  let lastTime: number;
  function animate(time: number): void {
    if (lastTime) {
      const delta = time - lastTime;
      updatePosition(delta);
    }
    lastTime = time;
    requestAnimationFrame(animate);
  }

  function handleResize() {
    if (browser) {
      containerWidth = window.innerWidth;
      containerHeight = window.innerHeight;

      // Ensure the bouncing image stays within the new boundaries
      position = Point.create(
        Math.min(Math.max(0, position.x), containerWidth - imageWidth),
        Math.min(Math.max(0, position.y), containerHeight - imageHeight)
      );
    }
  }

  function startTimer() {
    if (!timerStarted) {
      timerStarted = true;
      startTime = performance.now();
      updateTimer();
    }
  }

  function updateTimer() {
    if (timerStarted && !gameWon) {
      timerValue = performance.now() - startTime;
      requestAnimationFrame(updateTimer);
    }
  }

  function stopTimer() {
    timerStarted = false;
  }

  function handleParticleClick() {
    if (!timerStarted) {
      startTimer();
    }
    clickedParticles++;
  }

  onMount(() => {
    if (browser) {
      handleResize();
      requestAnimationFrame(animate);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        stopTimer();
      };
    }
  });
</script>

<svelte:window on:resize={handleResize} />

<SvelteSeo
  title="Mary Choi | Kingston's Personal Valet 🐶"
  description="Hi, I'm Mary, an Engineering Manager and Full Stack Engineer with healthcare experience. I build teams and robust, user-centric applications."
  openGraph={{
    title: "Mary Choi | Kingston's Personal Valet 🐶",
    description:
      "Hi, I'm Mary, an Engineering Manager and Full Stack Engineer with healthcare experience. I build teams and robust, user-centric applications.",
    type: "website",
    images: [
      { url: "/maryface.png", width: 460, height: 460, alt: "Mary" },
      { url: "/mary2.png", width: 433, height: 577, alt: "Mary" },
      { url: "/kingston.png", width: 748, height: 544, alt: "Kingston" },
    ],
    site_name: "Mary Choi",
  }}
/>

<svelte:head>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</svelte:head>

<div class="container" style="width: 100vw; height: 100vh;">
  <ParticleSystem
    {containerWidth}
    {containerHeight}
    particleCount={PARTICLE_COUNT}
    particleIcon={PARTICLE_ICON}
    staticIcon={STATIC_ICON}
    on:gameWon={handleGameWon}
    on:particleClick={handleParticleClick}
  />
  {#if !gameWon}
    <img
      bind:this={image}
      src="/maryface.png"
      alt="Mary Choi"
      on:load={handleImageLoad}
      style="position: absolute; left: {position.x}px; top: {position.y}px; width: {imageWidth}px; height: {imageHeight}px; z-index: 10;"
    />
  {:else}
    <img
      src={KINGSTON_ICON}
      alt="Kingston"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale({$scale}); max-width: 80%; max-height: 80%; object-fit: contain;"
    />
  {/if}
  <HeroBanner text={heroText} />
  <div class="game-stats">
    <p>Time: {(timerValue / 1000).toFixed(3)} seconds</p>
    <p>Score: {clickedParticles}/{PARTICLE_COUNT}</p>
    <div class="progress-bar">
      <div
        class="progress"
        style="width: {(clickedParticles / PARTICLE_COUNT) * 100}%"
      ></div>
    </div>
  </div>
  <footer class="footer">
    <a
      href="https://marymchoi.com"
      target="_blank"
      rel="noopener noreferrer"
      class="button"
    >
      Visit Mary's real site
    </a>
  </footer>
</div>

<style>
  .container {
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
    overflow: hidden;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    z-index: 20;
    opacity: 0.4;
  }

  .footer:hover {
    opacity: 1;
  }

  .button {
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 5px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 12px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 25px;
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: rgba(255, 255, 255, 0.6);
  }

  .game-stats {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    z-index: 20;
  }

  .progress-bar {
    width: 200px;
    height: 20px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }
</style>

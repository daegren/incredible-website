import * as Point from "$lib/point";
import * as Vector from "$lib/vector";

export interface Particle {
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

export function createParticle(containerWidth: number, containerHeight: number): Particle {
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

export function updateParticle(particle: Particle, deltaSeconds: number, containerWidth: number, containerHeight: number): Particle {
  if (particle.isStatic) return particle;

  let { position, speed, direction, rotation, rotationSpeed } = particle;

  position = Point.applyVector(Vector.scale(deltaSeconds * speed, Vector.normalize(direction)), position);

  if (position.x < 0 || (position.x + particle.size) > containerWidth) {
    direction = Vector.invertX(direction);
    position = Point.create(position.x < 0 ? 0 : containerWidth - particle.size, position.y);
  }
  if (position.y < 0 || (position.y + particle.size) > containerHeight) {
    direction = Vector.invertY(direction);
    position = Point.create(position.x, position.y < 0 ? 0 : containerHeight - particle.size);
  }

  rotation += rotationSpeed * deltaSeconds * 60;
  const opacity = 0.5 + Math.sin(Date.now() / 1000) * 0.25;

  return { ...particle, position, speed, rotation, opacity };
}
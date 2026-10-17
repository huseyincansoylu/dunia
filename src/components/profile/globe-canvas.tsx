"use client";

import { useEffect, useRef, useState } from "react";
import type { Topology } from "topojson-specification";
import { DOT_RADIUS, GLOBE_COLORS, GLOBE_RADIUS, type GlobePoint } from "@/lib/globe";
import { cn } from "@/lib/utils";

/** Degrees per second while idle. */
const SPIN_SPEED = 6;
/** Degrees of rotation per pixel dragged. */
const DRAG_SPEED = 0.35;
/** How long the globe rests after a drag before spinning again. */
const RESUME_AFTER_MS = 1800;

type GlobeCanvasProps = {
  visited: readonly string[];
  rotate: [number, number];
};

/**
 * Spins the globe and lets people turn it with a horizontal drag. Vertical swipes
 * still scroll the page. Loads its code and data after the first paint, then fades
 * in over the server-rendered SVG with the exact same picture.
 */
export function GlobeCanvas({ visited, rotate }: GlobeCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const visitedKey = visited.join(",");
  const [startλ, startφ] = rotate;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    let frame = 0;
    const cleanups: (() => void)[] = [];

    (async () => {
      const [{ geoGraticule10, geoOrthographic, geoPath }, { feature }, { default: data }] = await Promise.all([
        import("d3-geo"),
        import("topojson-client"),
        import("@/data/globe.json"),
      ]);
      if (cancelled) return;

      const visitedSet = new Set(visitedKey ? visitedKey.split(",") : []);
      type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { iso2: string | null }>;
      const topology = data.topology as unknown as Topology;
      const all = (feature(topology, topology.objects.countries) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso2: string | null }>).features;
      const isVisited = (f: CountryFeature) => !!f.properties.iso2 && visitedSet.has(f.properties.iso2);
      const land: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: all.filter((f) => !isVisited(f)) };
      const visitedLand: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: all.filter(isVisited) };
      const dots: GeoJSON.MultiPoint = {
        type: "MultiPoint",
        coordinates: (data.points as unknown as GlobePoint[])
          .filter(([iso2, , , small]) => small && visitedSet.has(iso2))
          .map(([, lon, lat]) => [lon, lat]),
      };
      const graticule = geoGraticule10();

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const projection = geoOrthographic().clipAngle(90);
      const path = geoPath(projection, ctx);
      let size = 0;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        size = canvas.clientWidth;
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        projection.scale(size * GLOBE_RADIUS).translate([size / 2, size / 2]);
      };

      let λ = startλ;
      const φ = startφ;

      const draw = () => {
        const c = size / 2;
        const r = size * GLOBE_RADIUS;
        projection.rotate([λ, φ]);
        ctx.clearRect(0, 0, size, size);

        ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = GLOBE_COLORS.ocean; ctx.fill();
        ctx.beginPath(); path(graticule); ctx.strokeStyle = GLOBE_COLORS.graticule; ctx.lineWidth = 0.6 * (size / 600); ctx.stroke();
        ctx.lineWidth = 0.5 * (size / 600);
        ctx.strokeStyle = GLOBE_COLORS.border;
        ctx.beginPath(); path(land); ctx.fillStyle = GLOBE_COLORS.land; ctx.fill(); ctx.stroke();
        ctx.beginPath(); path(visitedLand); ctx.fillStyle = GLOBE_COLORS.visited; ctx.fill(); ctx.stroke();
        path.pointRadius(DOT_RADIUS * (size / 600));
        ctx.beginPath(); path(dots); ctx.fill();

        const shade = ctx.createRadialGradient(c - r * 0.25, c - r * 0.35, 0, c - r * 0.25, c - r * 0.35, r * 1.3);
        shade.addColorStop(0, "rgba(255,255,255,0.1)");
        shade.addColorStop(0.6, "rgba(255,255,255,0)");
        shade.addColorStop(1, "rgba(0,0,0,0.35)");
        ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = shade; ctx.fill();
        ctx.strokeStyle = GLOBE_COLORS.rim; ctx.lineWidth = 1 * (size / 600); ctx.stroke();
      };

      resize();
      draw();
      setReady(true);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let visible = true;
      let dragging: { x: number; λ: number } | null = null;
      let resumeAt = 0;
      let last = performance.now();

      const tick = (now: number) => {
        const dt = Math.min(now - last, 100);
        last = now;
        if (!dragging && !reduceMotion && now >= resumeAt) {
          λ += (SPIN_SPEED * dt) / 1000;
          draw();
        }
        frame = visible ? requestAnimationFrame(tick) : 0;
      };
      frame = requestAnimationFrame(tick);

      // Stop spinning (and drawing) while the globe is scrolled out of view.
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
      });
      observer.observe(canvas);

      const onDown = (e: PointerEvent) => {
        dragging = { x: e.clientX, λ };
        canvas.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        λ = dragging.λ + (e.clientX - dragging.x) * DRAG_SPEED;
        draw();
      };
      const onUp = () => {
        dragging = null;
        resumeAt = performance.now() + RESUME_AFTER_MS;
      };
      const onResize = () => { resize(); draw(); };

      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      window.addEventListener("resize", onResize);
      cleanups.push(() => {
        observer.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        window.removeEventListener("resize", onResize);
      });
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
    };
  }, [visitedKey, startλ, startφ]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 size-full cursor-grab touch-pan-y transition-opacity duration-300 active:cursor-grabbing",
        ready ? "opacity-100" : "opacity-0"
      )}
    />
  );
}

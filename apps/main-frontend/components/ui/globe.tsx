"use client";

import { useEffect, useRef, useState } from "react";
import { Color, Scene, Fog, PerspectiveCamera } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
    interface ThreeElements {
        threeGlobe: any;
    }
}

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

type Position = {
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
};

export type GlobeConfig = {
    pointSize?: number;
    globeColor?: string;
    showAtmosphere?: boolean;
    atmosphereColor?: string;
    atmosphereAltitude?: number;
    emissive?: string;
    emissiveIntensity?: number;
    shininess?: number;
    polygonColor?: string;
    ambientLight?: string;
    directionalLeftLight?: string;
    directionalTopLight?: string;
    pointLight?: string;
    arcTime?: number;
    arcLength?: number;
    rings?: number;
    maxRings?: number;
    initialPosition?: {
        lat: number;
        lng: number;
    };
    autoRotate?: boolean;
    autoRotateSpeed?: number;
};

interface WorldProps {
    globeConfig: GlobeConfig;
    data: Position[];
}

function Globe({ globeConfig, data }: WorldProps) {
    const [globeData, setGlobeData] = useState<
        | {
            size: number;
            order: number;
            color: (t: number) => string;
            lat: number;
            lng: number;
        }[]
        | null
    >(null);

    const globeRef = useRef<any>(null);

    const defaultProps = {
        pointSize: globeConfig.pointSize || 1,
        atmosphereColor: globeConfig.atmosphereColor || "#ffffff",
        showAtmosphere: globeConfig.showAtmosphere !== undefined ? globeConfig.showAtmosphere : true,
        atmosphereAltitude: globeConfig.atmosphereAltitude || 0.1,
        polygonColor: globeConfig.polygonColor || "rgba(255,255,255,0.7)",
        globeColor: globeConfig.globeColor || "#1d072e",
        emissive: globeConfig.emissive || "#000000",
        emissiveIntensity: globeConfig.emissiveIntensity || 0.1,
        shininess: globeConfig.shininess || 0.9,
        arcTime: globeConfig.arcTime || 2000,
        arcLength: globeConfig.arcLength || 0.9,
        rings: globeConfig.rings || 1,
        maxRings: globeConfig.maxRings || 3,
        autoRotate: globeConfig.autoRotate !== undefined ? globeConfig.autoRotate : true,
        autoRotateSpeed:
            globeConfig.autoRotateSpeed !== undefined
                ? globeConfig.autoRotateSpeed
                : 0.5,
    };

    useEffect(() => {
        if (globeRef.current && globeData) {
            globeRef.current
                .showAtmosphere(defaultProps.showAtmosphere)
                .atmosphereColor(defaultProps.atmosphereColor)
                .atmosphereAltitude(defaultProps.atmosphereAltitude)
                .globeMaterial((material: any) => {
                    material.color = new Color(defaultProps.globeColor);
                    material.emissive = new Color(defaultProps.emissive);
                    material.emissiveIntensity = defaultProps.emissiveIntensity;
                    material.shininess = defaultProps.shininess;
                });
        }
    }, [globeData, defaultProps]);

    useEffect(() => {
        if (globeRef.current && globeData) {
            globeRef.current
                .arcsData(data)
                .arcStartLat((d: any) => d.startLat)
                .arcStartLng((d: any) => d.startLng)
                .arcEndLat((d: any) => d.endLat)
                .arcEndLng((d: any) => d.endLng)
                .arcColor((d: any) => d.color)
                .arcAltitude((d: any) => d.arcAlt)
                .arcStroke(0.3)
                .arcDashLength(defaultProps.arcLength)
                .arcDashInitialGap((d: any) => d.order)
                .arcDashGap(15)
                .arcDashAnimateTime(() => defaultProps.arcTime);

            globeRef.current
                .pointsData(data)
                .pointColor((d: any) => d.color)
                .pointsMerge(true)
                .pointAltitude(0.0)
                .pointRadius(2);

            globeRef.current
                .ringsData([])
                .ringColor(() => (t: any) => `rgba(255,255,255,${1 - t})`)
                .ringMaxRadius(defaultProps.maxRings)
                .ringPropagationSpeed(RING_PROPAGATION_SPEED)
                .ringRepeatPeriod(
                    (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings
                );
        }
    }, [globeData, data, defaultProps]);

    useEffect(() => {
        if (!globeData) {
            setGlobeData(
                data.map((arc) => ({
                    size: defaultProps.pointSize,
                    order: arc.order,
                    color: (t: number) => arc.color,
                    lat: arc.startLat,
                    lng: arc.startLng,
                }))
            );
        }
    }, [data, defaultProps.pointSize, globeData]);

    const { camera } = useThree();

    useEffect(() => {
        if (camera) {
            camera.position.z = cameraZ;
            camera.position.x = 0;
            camera.position.y = 0;

            if (globeConfig.initialPosition) {
                camera.lookAt(
                    globeConfig.initialPosition.lat,
                    globeConfig.initialPosition.lng,
                    0
                );
            }
        }
    }, [camera, globeConfig.initialPosition]);

    return (
        <>
            <threeGlobe ref={globeRef} />
            <ambientLight color={globeConfig.ambientLight || "#ffffff"} intensity={0.6} />
            <directionalLight
                color={globeConfig.directionalLeftLight || "#ffffff"}
                position={[-400, 100, 400]}
                intensity={0.8}
            />
            <directionalLight
                color={globeConfig.directionalTopLight || "#ffffff"}
                position={[-200, 500, 200]}
                intensity={0.8}
            />
            <pointLight
                color={globeConfig.pointLight || "#ffffff"}
                position={[200, 500, 200]}
                intensity={0.8}
            />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 3.5}
                maxPolarAngle={Math.PI - Math.PI / 3}
                autoRotate={defaultProps.autoRotate}
                autoRotateSpeed={defaultProps.autoRotateSpeed}
            />
        </>
    );
}

export function World(props: WorldProps) {
    const scene = new Scene();
    scene.fog = new Fog(0xffffff, 400, 2000);
    return (
        <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
            <Globe {...props} />
        </Canvas>
    );
}

export function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1]!, 16),
            g: parseInt(result[2]!, 16),
            b: parseInt(result[3]!, 16),
        }
        : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
    const arr = [];
    while (arr.length < count) {
        const r = Math.floor(Math.random() * (max - min)) + min;
        if (arr.indexOf(r) === -1) arr.push(r);
    }

    return arr;
}

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet }   from 'react-native';
import { GLView }             from 'expo-gl';
import * as THREE             from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper      } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

type ArrowProps = {
    bearing: number; // degrees, 0 = north
    color:   string; // CSS hex, e.g. "#ff4500"
};

export default function Arrow3D({ bearing, color }: ArrowProps) {
    const bearingRef  = useRef(bearing);
    const arrowRef    = useRef<THREE.Group>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const sceneRef    = useRef<THREE.Scene>();
    const frameRef    = useRef<number>();
    const leftLight   = useRef<THREE.RectAreaLight>(null!);
    const rightLight  = useRef<THREE.RectAreaLight>(null!);  

    useEffect(() => { bearingRef.current = bearing; }, [bearing]);

    useEffect(() => {
        if (arrowRef.current) {
            arrowRef.current.traverse(obj => {
                if ((obj as THREE.Mesh).isMesh) {
                    ((obj as THREE.Mesh).material as THREE.MeshStandardMaterial)
                        .color.set(color);
                }
            });
        }
    }, [color]);

    useEffect(() => {
        if (leftLight.current)  leftLight.current.color.set(color);
        if (rightLight.current) rightLight.current.color.set(color);
    }, [color]);

    const onContextCreate = (gl: any) => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            50,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 6);
        camera.lookAt(0, 1, 1);

        const fakeCanvas = {
            width:  gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
            style:  {},
            addEventListener:    () => {},
            removeEventListener: () => {},
            dispatchEvent:       () => false,
            getContext:          () => gl,
        };
        const renderer = new THREE.WebGLRenderer({
            canvas:   fakeCanvas as any,
            context:  gl,
            antialias: true,
        });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.shadowMap.enabled    = true;
        renderer.shadowMap.type       = THREE.PCFSoftShadowMap;
        renderer.physicallyCorrectLights = true;
        rendererRef.current = renderer;

        RectAreaLightUniformsLib.init();
        const opts = { intensity: 7, width: 0.5, height: 2.5 };
        

        leftLight.current  = new THREE.RectAreaLight(color, opts.intensity, opts.width, opts.height);   rightLight.current = new THREE.RectAreaLight(color, opts.intensity, opts.width, opts.height);

        leftLight.current.position.set(-1, 2, -1.5);
        leftLight.current.lookAt(0, 1, 2);
        rightLight.current.position.set( 1, 2, -1.5);
        rightLight.current.lookAt(0, 1, 2);
        

        scene.add(leftLight.current, rightLight.current);
        
        scene.add(
            new RectAreaLightHelper(leftLight.current),
            new RectAreaLightHelper(rightLight.current)
        );

        const fill = new THREE.DirectionalLight(0xffffff, 0.1);
        fill.position.set(0, 10, 0);
        scene.add(fill);

        const floorGeo = new THREE.BoxGeometry(20, 0.2, 20);
        const floorMat = new THREE.MeshStandardMaterial({
            color:     0xfafafa,
            roughness: 0.3,
            metalness: 0.1,
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = -0.1;
        floor.receiveShadow = true;
        scene.add(floor);

        const totalH = 1 + 0.6;    
        const centerY = totalH / 2;

        const group    = new THREE.Group();
        const shaftGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
        const headGeo  = new THREE.ConeGeometry(0.4, 0.6, 4);
        const mat      = new THREE.MeshStandardMaterial({ color });

        const shaft = new THREE.Mesh(shaftGeo, mat);

        shaft.position.y = 0.5  - centerY;
        shaft.castShadow = true;

        const head = new THREE.Mesh(headGeo, mat);
        head.position.y  = 1.3  - centerY;
        head.castShadow = true;

        group.add(shaft, head);

        group.rotation.x = -Math.PI / 3;

        group.position.set(0, centerY + 0.1, 0);

        scene.add(group);
        arrowRef.current = group;

        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);
            if (arrowRef.current) {
                arrowRef.current.rotation.z =
                    THREE.MathUtils.degToRad(-bearingRef.current);
            }
            renderer.render(scene, camera);
            gl.endFrameEXP();
        };
        animate();
    };

    useEffect(() => () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        rendererRef.current?.dispose();
        sceneRef.current?.clear();
    }, []);

    return (
        <View style={styles.container}>
            <GLView style={styles.glView} onContextCreate={onContextCreate} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'stretch' },
    glView:    { flex: 1, alignSelf: 'stretch' },
});

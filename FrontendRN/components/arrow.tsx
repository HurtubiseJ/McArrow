import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { ExpoWebGLRenderingContext } from "expo-gl";
import GLView from 'expo-gl';
import * as THREE from 'three'; 
import ExpoTHREE from 'expo-three';

const Renderer = ExpoTHREE.Renderer;

type ArrowProps = {
    bearing: number; // degrees
    color: string; // #ff0000
}

export default function Arrow3D({bearing, color}: ArrowProps){
    const arrowMesh = useRef<THREE.Group>();

    const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
        const scene = new THREE.Scene(); // New scene

        const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000); // New camera
        camera.position.z = 4;

        const renderer = new Renderer({ gl }); // Create renderer
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const ambientLight = new THREE.AmbientLight(color, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(color, 1);
        directionalLight.position.set(0, 2, 4); 
        scene.add(directionalLight);

        const shaft = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
        const head = new THREE.ConeGeometry(0.15, 0.3, 32);

        const material = new THREE.MeshStandardMaterial({color: color});

        const shaftMesh = new THREE.Mesh(shaft, material);
        const headMesh = new THREE.Mesh(head, material);

        shaftMesh.position.y = 0.5;
        headMesh.position.y = 1;

        const group = new THREE.Group();
        group.add(shaftMesh);
        group.add(headMesh);
        scene.add(group)

        arrowMesh.current = group; 

        const render = () => { // Render loop
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            gl.endFrameEXP();
        };
        render();
    }

    useEffect(() => {
        if (arrowMesh.current) {
            const radians = THREE.MathUtils.degToRad(bearing);
            arrowMesh.current.rotation.y = radians;
        }
    }, [bearing]);

    return (
        <View style={{ flex: 1 }}>
            <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
        </View>
    );
}


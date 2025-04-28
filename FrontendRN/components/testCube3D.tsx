import React from 'react';
import { View } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

export default function TestCube3D() {
  const onContextCreate = (gl: any) => {
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const fakeCanvas = {
      width:  gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      style:   {},
      addEventListener:    (_: string, __: any) => {},
      removeEventListener: (_: string, __: any) => {},
      dispatchEvent:       (_: any) => false,
      getContext:          () => gl,
    };

    const renderer = new THREE.WebGLRenderer({
      canvas:   fakeCanvas as any,
      context:  gl,
      antialias: true,
    });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    scene.background = new THREE.Color(0x888888);

    const geo  = new THREE.BoxGeometry(2, 2, 2);
    const mat  = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geo, mat);
    scene.add(cube);

    let firstFrame = true;
    const animate = () => {
      requestAnimationFrame(animate);

      if (firstFrame) {
        console.log(
          '[Cube] first render, size:',
          gl.drawingBufferWidth,
          '×',
          gl.drawingBufferHeight
        );
        firstFrame = false;
      }

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.02;

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return (
    <View style={{ flex: 1 }}>
      <GLView
        style={{
            flex: 1,
            alignSelf: 'stretch', 
            width: '100%',
            height: '100%',
            borderWidth: 2,
            borderColor: 'red',
            backgroundColor: '#333',
        }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

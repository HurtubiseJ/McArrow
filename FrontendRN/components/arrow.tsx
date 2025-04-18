import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

type ArrowProps = {
  bearing: number;    // degrees, where 0 = “north”
  color: string;      // CSS hex, e.g. "#ff4500"
};

export default function Arrow3D({ bearing, color }: ArrowProps) {
  const bearingRef = useRef(bearing);
  useEffect(() => {
    bearingRef.current = bearing;
  }, [bearing]);

  const arrowRef = useRef<THREE.Group>();

  const onContextCreate = (gl: any) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(
      60,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);

    const fakeCanvas = {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      style: {},
      addEventListener:    (_: string, __: any) => {},
      removeEventListener: (_: string, __: any) => {},
      dispatchEvent:       (_: any) => false,
      getContext:          () => gl,
    };

    const renderer = new THREE.WebGLRenderer({
      canvas:  fakeCanvas as any,
      context: gl,
      antialias: true,
    });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const amb = new THREE.AmbientLight(color, 0.5);
    const dir = new THREE.DirectionalLight(color, 0.8);
    dir.position.set(2, 2, 2);
    scene.add(amb, dir);

    // Build arrow geometry (shaft + head)
    const group    = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 16);
    const headGeo  = new THREE.ConeGeometry(0.06, 0.2, 16);
    const mat      = new THREE.MeshStandardMaterial({ color });

    const shaft = new THREE.Mesh(shaftGeo, mat);
    const head  = new THREE.Mesh(headGeo, mat);
    shaft.position.y = 0.5;
    head.position.y  = 1.1;
    group.add(shaft, head);

    group.position.set(0, 0, 0);
    group.scale.set(1.5, 1.5, 1.5);

    scene.add(group);
    arrowRef.current = group;

    const animate = () => {
      requestAnimationFrame(animate);

      if (arrowRef.current) {
        arrowRef.current.rotation.z = THREE.MathUtils.degToRad(-bearingRef.current);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
  },
  glView: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

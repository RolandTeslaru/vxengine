"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import splinePointsData from "@/SplinePositions.json";
import { Html } from '@react-three/drei';

const ARC_SEGMENTS = 200;
const point = new THREE.Vector3();


const Spline = ({ splineKey, splineIndex, saveLocation, transformControl, setSelectedSpline }) => {
  const splineHelperObjects = useRef([]);
  const splinePointsLength = useRef(4);
  const [positions, setPositions] = useState([]);
  const splines = useRef({});
  const htmlElements = useRef([]);
  const { camera, gl, scene } = useThree();

  const geometry = new THREE.BoxGeometry(2, 2, 2);

  const createSpline = (initialPositions, color, curveType) => {
    const curve = new THREE.CatmullRomCurve3(initialPositions);
    curve.curveType = curveType;
    (curve as any).mesh = new THREE.Line(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3)
      ),
      new THREE.LineBasicMaterial({ color, opacity: 0.35 })
    );
    (curve as any).mesh.frustumCulled = false;
    return curve;
  };



  const load = (new_positions) => {
    const newSplineHelperObjects = [];
    const newPositions = [];

    for (let i = 0; i < new_positions.length; i++) {
      const newObject = addSplineObject(new_positions[i]);
      newSplineHelperObjects.push(newObject);
      newPositions.push(newObject.position);
    }

    splineHelperObjects.current = newSplineHelperObjects;
    setPositions(newPositions);
    splinePointsLength.current = new_positions.length;
  };

  const updateSplineOutline = useCallback(() => {
    for (const k in splines.current) {
      const spline = splines.current[k];
      const splineMesh = spline.mesh;
      const position = splineMesh.geometry.attributes.position;

      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1);
        spline.getPoint(t, point);
        position.setXYZ(i, point.x, point.y, point.z);
      }

      position.needsUpdate = true;
    }
    // writeSplineToFile();
  }, []);

  const addSplineObject = (position?: THREE.Vector3) => {
    const MULTIPLIER = 50.0

    const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    const object = new THREE.Mesh(geometry, material);

    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = (Math.random() * 10 - 5) * MULTIPLIER;
      object.position.y = (Math.random() * 6 - 3) * MULTIPLIER;
      object.position.z = (Math.random() * 8 - 4) * MULTIPLIER;
    }

    object.castShadow = true;
    object.receiveShadow = true;

    object.addEventListener("change", updateSplineOutline)

    return object;
  };


  useEffect(() => {
    const selectedPoints = splinePointsData["desktopSplinePoints"].map(p => new THREE.Vector3(p[0], p[1], p[2]));
    load(selectedPoints);

    // Set up splines
    const newSplines: any = {};

    newSplines.uniform = createSpline(selectedPoints, 0xff0000, 'catmullrom');
    newSplines.centripetal = createSpline(selectedPoints, 0x00ff00, 'centripetal');
    newSplines.chordal = createSpline(selectedPoints, 0x0000ff, 'chordal');

    splines.current = newSplines;
  }, [])

  useEffect(() => {
    if (positions.length) {
      for (const k in splines.current) {
        splines.current[k].points = positions; // Update spline points with positions
      }
      updateSplineOutline();
    }
  }, [positions]);

  const handlePositionChange = (index, axis, value) => {
    const newPositions = [...positions];
    newPositions[index][axis] = parseFloat(value);
    setPositions(newPositions);
    splineHelperObjects.current[index].position[axis] = parseFloat(value);
    updateSplineOutline();
  };

  const addPointFunction = () => {
    splinePointsLength.current++;
    const newObject = addSplineObject();
    splineHelperObjects.current.push(newObject);
    setPositions(splineHelperObjects.current.map(obj => obj.position));
    updateSplineOutline();
  };

  const removePointFunction = (index) => {
    if (splinePointsLength.current <= 4) {
      return;
    }

    splinePointsLength.current--;
    const newSplineHelperObjects = [...splineHelperObjects.current];
    newSplineHelperObjects.splice(index, 1);
    splineHelperObjects.current = newSplineHelperObjects;
    setPositions(splineHelperObjects.current.map(obj => obj.position));
    updateSplineOutline();
  };

  const addPointBetweenFunction = (index: number) => {
    if (index + 1 >= splineHelperObjects.current.length) {
      return;
    }

    const position1 = splineHelperObjects.current[index].position;
    const position2 = splineHelperObjects.current[index + 1].position;
    const midpoint = new THREE.Vector3(
      (position1.x + position2.x) / 2,
      (position1.y + position2.y) / 2,
      (position1.z + position2.z) / 2
    );

    splinePointsLength.current++;
    const newObject = addSplineObject(midpoint);
    const newSplineHelperObjects = [...splineHelperObjects.current];
    newSplineHelperObjects.splice(index + 1, 0, newObject);
    splineHelperObjects.current = newSplineHelperObjects;
    setPositions(splineHelperObjects.current.map(obj => obj.position));
    updateSplineOutline();
  };

  const loadSplineFunction = () => {
    const storedPositions = localStorage.getItem('splinePositions');
    if (storedPositions) {
      const parsedPositions = JSON.parse(storedPositions).map(p => new THREE.Vector3(p.x, p.y, p.z));
      load(parsedPositions);
    }
  };

  const handleSplineSelectionChange = (event) => {
    const selected = event.target.value;
    const selectedPoints = splinePointsData[selected].map(p => new THREE.Vector3(p[0], p[1], p[2]));
    load(selectedPoints);
  };

  const writeSplineToFile = async () => {
    const points = [];

    for (let i = 0; i < splinePointsLength.current; i++) {
      const p = splineHelperObjects.current[i].position;
      points.push([p.x, p.y, p.z]);
    }

    try {
      const response = await fetch('/api/writeSpline', {
        method: 'POST',
        body: JSON.stringify({ splineKey, points }),
      });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error saving positions:', error);
    }
  }

  const exportSplineFunction = () => {
    const points = [];

    for (let i = 0; i < splinePointsLength.current; i++) {
      const p = splineHelperObjects.current[i].position;
      points.push(`[${p.x}, ${p.y}, ${p.z}]`);
    }

    const code = `"desktopSplinePoints": [\n\t${points.join(',\n\t')}\n]`;
    prompt('copy and paste code', code);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateSplineOutline();
    }, 1000); // Update every 1 second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [updateSplineOutline]);

  useFrame(() => {
    splineHelperObjects.current.forEach((obj, index) => {
      const htmlElement = htmlElements.current[index];
      if (htmlElement) {
        const distance = camera.position.distanceTo(obj.position);
        const scale = Math.min(Math.max(1 / (distance / 10), 0.01), 1); // Adjust scaling factor as needed
        htmlElement.style.transform = `scale(${scale})`;
      }
    });
  });

  return (
    <>
      {splineHelperObjects.current.map((obj, index) => (
        <group key={index}
          onPointerDown={(e) => {
            console.log("On pointer down ")
          }}
        >
          <primitive
            editableType='mesh'
            object={obj}
          >
            <meshBasicMaterial color="blue" />
            <Html
              // @ts-expect-error 
              ref={(el) => htmlElements.current[index] = el}
            >
              <div className={`vexrSplineNode_${splineIndex}_${index}  relative flex flex-col ${index === 0 ? 'splineEditorControls border border-white rounded-lg p-2' : ''}`}>
                <div className='flex'>
                  <p className='text-2xl font-bold mr-2 my-auto h-auto'>{index}</p>
                  <div className='flex-row text-nowrap'>
                    {index !== 0 ?
                      <p>VEXR Spline Node</p>
                      :
                      <p>VEXR Control Node</p>
                    }
                    <p className='text-xs text-opacity-80 text-neutral-400'>attached to spline {splineIndex}</p>
                    <div className='font-sans-menlo flex flex-col text-xs text-neutral-400'>
                      <label>
                        X:
                        <input
                          className='!bg-none w-[100px]'
                          style={{ backgroundColor: 'transparent' }}
                          type='number'
                          value={obj.position.x.toFixed(5)}
                          step={0.1}
                          onChange={(e) => handlePositionChange(index, 'x', e.target.value)}
                        />
                      </label>
                      <label>
                        Y:
                        <input
                          className='!bg-none w-[100px]'
                          style={{ backgroundColor: 'transparent' }}
                          type='number'
                          value={obj.position.y.toFixed(5)}
                          step={0.1}
                          onChange={(e) => handlePositionChange(index, 'y', e.target.value)}
                        />
                      </label>
                      <label>
                        Z:
                        <input
                          className='!bg-none w-[100px]'
                          style={{ backgroundColor: 'transparent' }}
                          type='number'
                          value={obj.position.z.toFixed(5)}
                          step={0.1}
                          onChange={(e) => handlePositionChange(index, 'z', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {/* Control Node 0 */}
                {index === 0 && (
                  <div className='controls text-left flex flex-col font-sans-menlo'>
                    <select className='text-black' onChange={handleSplineSelectionChange} value={splineKey}>
                      {Object.keys(splinePointsData).map((key) => (
                        <option className='text-black' key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                    <button onClick={addPointFunction}>Add Point</button>
                    <button onClick={() => removePointFunction(index)}>Remove Point</button>
                    <button onClick={writeSplineToFile}>Write to JSON</button>
                    <button onClick={() => addPointBetweenFunction(index)}>Insert Point</button>
                  </div>
                )}
                {index !== 0 && <>
                  <button onClick={() => removePointFunction(index)}>Remove Point</button>
                  <button onClick={() => addPointBetweenFunction(index)}>Insert Point</button>
                </>}
              </div>
            </Html>
          </primitive>
        </group>
      ))}
      {Object.keys(splines.current).map((key) => (
        <primitive key={key} object={(splines.current[key] as any).mesh} />
      ))}
    </>
  );
};

export default Spline
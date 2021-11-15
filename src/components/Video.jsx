import React, {useState, useEffect} from 'react';
import {drawConnectors, drawLandmarks} from '@mediapipe/drawing_utils';
import {HAND_CONNECTIONS, Hands} from '@mediapipe/hands';
import {Camera} from '@mediapipe/camera_utils';
import * as tf from '@tensorflow/tfjs'
import Webcam from 'react-webcam';
import '../styles/components/Video.css'

const Video = () => {
  const webcamRef = React.useRef(null);
  const canvasReference = React.useRef(null);
  const [cameraReady, setCameraReady] = useState(false);

  // const model = await tf.loadLayersModel('https://foo.bar/model.json');
  
  function onResults(results) {
    canvasReference.current.width = webcamRef.current.video.videoWidth;
    canvasReference.current.height = webcamRef.current.video.videoHeight;
    const canvasCtx = canvasReference.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasCtx.width, canvasCtx.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(
          canvasCtx, 
          landmarks, 
          HAND_CONNECTIONS,
          {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
      }
    }
    canvasCtx.restore();
  }

  useEffect(() => {
    
    const hands = new Hands({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    hands.onResults(onResults);
    
    if (typeof webcamRef.current !== "undefined" &&
    webcamRef.current !== null){
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({image: webcamRef.current.video});
        },
        width: 1280,
        height: 720
      });
      camera.start();
    }

  }, []);
  return (
    <div className="Video">
        <Webcam 
          className="input_video" 
          ref={webcamRef}
          onUserMedia={() => {
            console.log('webcamRef.current', webcamRef.current);
            setCameraReady(true)
            console.log(cameraReady)
          }
        }
        style={{
          width: 640,
          height: 480,
        }}
        ></Webcam>
        <canvas 
          ref={canvasReference}
          className="output_canvas" 
          style={{
            position: "absolute",
            // marginLeft: "auto",
            // marginRight: "auto",
            left: 0,
            // right: 0,
            // textAlign: "center",
            // zindex: 9,
            width: 640,
            height: 480,
          }}

        ></canvas>
      </div>
  );
};

export default Video;
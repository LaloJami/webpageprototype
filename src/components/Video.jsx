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
  const [model, setModel] = useState();
  const [ready, setReady] = useState(false);
  const [positionRes, setPositionRes] = useState(-1);
  const pathName = 'http://192.168.174.31:5500/src/models/model.json';
  const alphabet = ['a', 'b', 'c', 'd', 'e', 'f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
  async function loadModel(path) {
    try {
      const model = await tf.loadLayersModel(path);
      setModel(model);
      console.log("Load model success")
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(()=>{
    tf.ready().then(()=>{
    loadModel(pathName)
    setReady(true)
    });
  },[])

  // console.log(model)
  function calc_landmark_list(image, landmarks) {
    const imageWidth = image.current.width;
    const imageHeight = image.current.height;
    const landmarkArray = [];
    landmarks.map(landmark=>{
      const landmarkX = Math.min((landmark.x * imageWidth), imageWidth - 1)
      const landmarkY = Math.min((landmark.y * imageHeight), imageHeight - 1)
      const landmarkPoint = [landmarkX, landmarkY];
      landmarkArray.push(landmarkPoint)
    })
    return landmarkArray;
  }

  function pre_process_landmark(landmarkList) {
    // let tempLandmarkList = [...landmarkList]
    //Convert to relative coordinates
    let baseX = 0
    let baseY = 0
    const tempLandmarkList = landmarkList.map((item, index) => {
      if(index===0){
        baseX = item[0]
        baseY = item[1]
      }
      return [landmarkList[index][0] - baseX, landmarkList[index][1] - baseY]
    })
    //Convert to a one-dimensional list
    //Normalization
    const maxValue = tempLandmarkList.flat().reduce((maxi, element) => Math.max(maxi, Math.abs(element)), -1)
    const resultList = tempLandmarkList.flat().map((item) => (item/maxValue))
    return resultList;
  }
  
  function onResults(results) {
    canvasReference.current.width = webcamRef.current.video.videoWidth;
    canvasReference.current.height = webcamRef.current.video.videoHeight;
    const canvasCtx = canvasReference.current.getContext('2d');
    canvasCtx.translate(canvasReference.current.width, 0)
    canvasCtx.scale(-1,1)
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasCtx.width, canvasCtx.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        const resultLandmark = calc_landmark_list(canvasReference,landmarks)
        const preResultLandmark = pre_process_landmark(resultLandmark)
        if(ready){
          const predictionRes = model.predict(tf.tensor(preResultLandmark).reshape([-1, 42]))
          const values = predictionRes.dataSync();
          const arr = Array.from(values);
          const maxValue = Math.max(...arr)
          console.log(arr.indexOf(maxValue));
          setPositionRes(arr.indexOf(maxValue))
        }
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
        mirrored={true}
        onUserMedia={() => {
          console.log('webcamRef.current', webcamRef.current);
          setCameraReady(true)
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
      {positionRes===-1?(<p></p>):(<p>{'Your letter is: '+alphabet[positionRes]}</p>)}
    </div>
  );
};

export default Video;
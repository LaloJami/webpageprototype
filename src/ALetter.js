// Import dependencies
import {Finger, FingerCurl, FingerDirection, GestureDescription} from 'fingerpose'; 

// Define Gesture Description
export const ALetterGesture = new GestureDescription('A'); 

// Thumb 
ALetterGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.7)
ALetterGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.25);

// Index
ALetterGesture.addCurl(Finger.Index, FingerCurl.HalfCurl, 0.7)
ALetterGesture.addDirection(Finger.Index, FingerDirection.VerticalDown, 0.25);

// Middle
ALetterGesture.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.7)
ALetterGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, 0.25);

// Ring
ALetterGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.7)
ALetterGesture.addDirection(Finger.Ring, FingerDirection.VerticalDown, 0.25);

// Pinky
ALetterGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.7)
ALetterGesture.addDirection(Finger.Pinky, FingerDirection.VerticalDown, 0.25);

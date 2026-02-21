import * as faceapi from "face-api.js";

const MODEL_URL = "/models";
let modelsReady = false;
let modelsPromise: Promise<void> | null = null;

export const loadFaceModels = async () => {
  if (modelsReady) return;
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      modelsReady = true;
    });
  }
  await modelsPromise;
};

export const getDescriptorFromVideo = async (video: HTMLVideoElement) => {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor ?? null;
};

export const distance = (a: number[], b: number[]) => {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

export const findBestMatch = (
  target: Float32Array,
  descriptors: number[][],
  threshold = 0.45
) => {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestIndex = -1;

  descriptors.forEach((descriptor, index) => {
    const current = distance(Array.from(target), descriptor);
    if (current < bestDistance) {
      bestDistance = current;
      bestIndex = index;
    }
  });

  return {
    match: bestDistance <= threshold,
    distance: bestDistance,
    index: bestIndex,
  };
};

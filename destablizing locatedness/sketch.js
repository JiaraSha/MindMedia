// p5live
let myCanvas, myVideo;
let people = {};  //make it an associatvie array with each person labeled by network id
let p5lm 
//

// p5live
// function setup() {
//   myCanvas = createCanvas(512, 512);
//   myCanvas.hide();
//   let captureConstraints =  allowCameraSelection(myCanvas.width,myCanvas.height) ;
//   myVideo = createCapture(captureConstraints, videoLoaded);
//   //below is simpler if you don't need to select Camera because default is okay
//   //myVideo = createCapture(VIDEO, videoLoaded);
//   myVideo.size(myCanvas.width, myCanvas.height);
//   myVideo.elt.muted = true;
//   myVideo.hide()

//   //create the local thing
//   creatNewVideoObject(myVideo, "me");
// }

// function videoLoaded(stream) {
//   p5lm = new p5LiveMedia(this, "CAPTURE", stream, "mycrazyroomname")
//   p5lm.on('stream', gotStream);
//   p5lm.on('data', gotData);
//   p5lm.on('disconnect', gotDisconnect);
// }

// function gotData(data, id) {
//   // If it is JSON, parse it
//   let d = JSON.parse(data);
//   positionOnCircle(d.angleOnCircle, people[id].object);
//   if (d.loc.lat != myLoc.lat && d.loc.lng != myLoc.lng){
//       console.log("in different places");
//   }
// }

// function gotStream(videoObject, id) {
//   //this gets called when there is someone else in the room, new or existing
//   videoObject.hide();  //don't want the dom object, will use in p5 and three.js instead
//   //get a network id from each person who joins
//   creatNewVideoObject(videoObject, id);
// }

// function gotDisconnect(id) {
//   people[id].videoObject.remove(); //dom version
//   scene.remove(people[id].object); //three.js version
//   delete people[id];  //remove from our variable
// }

// function creatNewVideoObject(videoObject, id) {  //this is for remote and local
  
//   var videoGeometry = new THREE.PlaneGeometry(512, 512);
//   let myTexture = new THREE.Texture(videoObject.elt);  //NOTICE THE .elt  this give the element
//   let videoMaterial = new THREE.MeshBasicMaterial({ map: myTexture, side: THREE.DoubleSide });
//   videoMaterial.map.minFilter = THREE.LinearFilter;  //otherwise lots of power of 2 errors
//   myAvatarObj = new THREE.Mesh(videoGeometry, videoMaterial);

//   scene.add(myAvatarObj);

//   //they can move that around but we need to put you somewhere to start
//   angleOnCircle = positionOnCircle(null, myAvatarObj);

//   //remember a bunch of things about each connection in json but we are really only using texture in draw
//   //use an named or associate array where each oject is labeled with an ID
//   people[id] = { "object": myAvatarObj, "texture": myTexture, "id": id, "videoObject": videoObject, "angleOnCircle": angleOnCircle };

// }

// function positionOnCircle(angle, thisAvatar) {
//   //position it on a circle around the middle
//   if (angle == null) { //first time
//       angle = random(2*Math.PI); 
//   }
//     //imagine a circle looking down on the world and do High School math
//   let distanceFromCenter = 800;
//   x = distanceFromCenter * Math.sin(angle);
//   z = distanceFromCenter * Math.cos(angle);
//   thisAvatar.position.set(x, 0, z);  //zero up and down
//   thisAvatar.lookAt(0, 0, 0);  //oriented towards the camera in the center
//   return angle;
// }

// function draw() {
//   //go through all the people an update their texture, animate would be another place for this
//   for(id in people){
//       let thisPerson = people[id];
//       if (thisPerson .videoObject.elt.readyState == thisPerson .videoObject.elt.HAVE_ENOUGH_DATA) {
//           //check that the transmission arrived okay
//           //then tell three that something has changed.
//           thisPerson.texture.needsUpdate = true;
//       }
//   }
// }


// ///move people around and tell them about 
// function keyPressed() {
//   let me = people["me"];
//   if (keyCode == 37 || key == "a") {
//       me.angleOnCircle -= .01;

//   } else if (keyCode == 39 || key == "d") {
//       me.angleOnCircle += .01;
  

//   } else if (keyCode == 38 || key == "w") {

//   } else if (keyCode == 40 || key == "s") {

//   }
//   positionOnCircle(me.angleOnCircle, me.object); //change it locally 
//   //send it to others
//   let dataToSend = { "angleOnCircle": me.angleOnCircle , "loc":myLoc};
//   p5lm.send(JSON.stringify(dataToSend));

// }
//

// three.js setup
let camera3D;
const width = window.innerWidth;
const height = window.innerHeight;

// Setup scene
const scene = new THREE.Scene();
//init3D();


//  We use an orthographic camera here instead of persepctive one for easy mapping
//  Bounded from 0 to width and 0 to height
// Near clipping plane of 0.1; far clipping plane of 1000
const camera = new THREE.OrthographicCamera(0,width,0,height, 0.1, 1000);
//camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera3D.position.z = 500;
camera.position.z = 500;

// Setting up the renderer
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width, height );
renderer.setClearColor( 0xadc6cb, 0 );

// Attach the threejs animation to the div with id of threeContainer
const container = document.getElementById( 'threeContainer' );
container.appendChild( renderer.domElement );

// Scene lighting
const hemiLight     = new THREE.HemisphereLight('#EFF6EE', '#EFF6EE', 0 );
hemiLight.position.set( 0, 0, 0 );
scene.add( hemiLight );


const group = new THREE.Group();

// Creating Tracker class
function Tracker(){
  this.position = new THREE.Vector3();

  const geometry = new THREE.SphereGeometry(100,7,7);
  //const geometry = new THREE.PlaneGeometry(520, 520);
  //const geometry = new THREE.TorusKnotGeometry( 100, 30, 10, 160 );
  //const geometry = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true);
  //const texture = new THREE.Texture(video.elt);
  const texture = new THREE.VideoTexture( video );
  // const material = new THREE.MeshToonMaterial({
  //                                             color: 0xEFF6EE, 
  //                                             opacity:0.5, 
  //                                             transparent:true, 
  //                                             wireframe:true, 
  //                                             emissive: 0xEFF6EE,
  //                                             emissiveIntensity:1});
  const basicmaterial = new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide});
  basicmaterial.map.minFilter = THREE.LinearFilter;                                      

  //const sphere = new THREE.Mesh(geometry, material);
  const sphere = new THREE.Mesh(geometry, basicmaterial);
  group.add(sphere);


  this.initialise = function() {
    this.position.x = -10;
    this.position.y = -10;
    this.position.z = 0;
  }

  this.update = function(x,y,z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  this.display = function() {
    sphere.position.x = this.position.x;
    sphere.position.y = this.position.y;
    sphere.position.z = this.position.z;

    // console.log(sphere.position);
  }
}


scene.add( group );

const prevFog = true;


// POSENET
// Adapted from code at https://github.com/tensorflow/tfjs-models/blob/master/posenet/demos/camera.js

// Check on the device that you are viewing it from
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

// Load camera
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = width;
  video.height = height;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      //width: mobile ? undefined : width,
      width: 1250,
      //height: mobile ? undefined : height,
      height:750
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

// Net will hold the posenet model

let net;

// Initialise trackers to attach to body parts recognised by posenet model

let trackers = [];

for (let i=0; i<17; i++){
  let tracker = new Tracker();
  tracker.initialise();
  tracker.display();

  trackers.push(tracker);
}


// Main animation loop
function render(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  // Flip the webcam image to get it right
  const flipHorizontal = true;

  canvas.width = width;
  canvas.height = height;

  async function detect() {

    // Load posenet
    // net = await posenet.load(0.5);
    const net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 513,
      multiplier: 0.75
    });

    // Scale the image. The smaller the faster
    const imageScaleFactor = 0.75;

    // Stride, the larger, the smaller the output, the faster
    const outputStride = 32;

    // Store all the poses
    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;

    const pose = await net.estimateSinglePose(video, 
                                              imageScaleFactor, 
                                              flipHorizontal, 
                                              outputStride);
    poses.push(pose);

    // Show a pose (i.e. a person) only if probability more than 0.1
    minPoseConfidence = 0.1;
    // Show a body part only if probability more than 0.3
    minPartConfidence = 0.3;

    ctx.clearRect(0, 0, width, height);

    const showVideo = true;

    if (showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      // ctx.filter = 'blur(5px)';
      ctx.filter = 'opacity(50%) blur(3px) grayscale(100%)';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    }

    poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
        keypoints.forEach((d,i)=>{
          if(d.score>minPartConfidence){
          // console.log(d.part);
          // Positions need some scaling
          trackers[i].update(-d.position.x+width, d.position.y,0);
          trackers[i].display();
          }
          // Move out of screen if body part not detected
          else if(d.score<minPartConfidence){
          trackers[i].update(-10,-10,0);
          trackers[i].display();
          }
        })
      }
    });

    renderer.render( scene, camera );
    requestAnimationFrame(detect);
  }

  detect();

}


async function main() {
  // Load posenet
  // const net = await posenet.load(0.75);
  const net = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: 513,
    multiplier: 0.75
  });

  document.getElementById('main').style.display = 'block';
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  render(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


main();



/////MOUSE STUFF

var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0;
var lon = -90, onMouseDownLon = 0;
var lat = 0, onMouseDownLat = 0;
var isUserInteracting = false;


function moveCameraWithMouse() {
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);
    camera3D.target = new THREE.Vector3(0, 0, 0);
}

function onDocumentKeyDown(event) {
    //if (event.key == " ") {
    //in case you want to track key presses
    //}
}

function onDocumentMouseDown(event) {
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
}

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        computeCameraOrientation();
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    camera3D.fov += event.deltaY * 0.05;
    camera3D.updateProjectionMatrix();
}

function computeCameraOrientation() {
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.Math.degToRad(90 - lat);  //restrict movement
    let theta = THREE.Math.degToRad(lon);
    camera3D.target.x = 10000 * Math.sin(phi) * Math.cos(theta);
    camera3D.target.y = 10000 * Math.cos(phi);
    camera3D.target.z = 10000 * Math.sin(phi) * Math.sin(theta);
    camera3D.lookAt(camera3D.target);
}


function onWindowResize() {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}


function createPullDownForCameraSelection() {
    //manual alternative to all of this pull down stuff:
    //type this in the console and unfold resulst to find the device id of your preferredwebcam, put in sourced id below
    //navigator.mediaDevices.enumerateDevices()
    preferredCam = localStorage.getItem('preferredCam')
    if (preferredCam) {
        videoOptions = {
            video: {
                width: myCanvas.width,
                height: myCanvas.height,
                sourceId: preferredCam
            }
        };
    } else {
        videoOptions = {
            audio: true, video: {
                width: myCanvas.width,
                height: myCanvas.height
            }
        };
    }
    navigator.mediaDevices.enumerateDevices().then(function (d) {
        var sel = createSelect();
        sel.position(10, 10);
        for (var i = 0; i < d.length; i++) {
            if (d[i].kind == "videoinput") {
                let label = d[i].label;
                let ending = label.indexOf('(');
                if (ending == -1) ending = label.length;
                label = label.substring(0, ending);
                sel.option(label, d[i].deviceId)
            }
            if (preferredCam) sel.selected(preferredCam);
        }
        sel.changed(function () {
            let item = sel.value();
            console.log(item);
            localStorage.setItem('preferredCam', item);
            videoOptions = {
                video: {
                    optional: [{
                        sourceId: item
                    }]
                }
            };
            myVideo.remove();
            myVideo = createCapture(videoOptions, VIDEO);
            myVideo.hide();
            console.log(videoOptions);
        });
    });
}
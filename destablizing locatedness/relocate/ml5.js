
let camera3D, scene, renderer, cube;
let dir = 0.01;
let myCanvas, myVideo, p5CanvasTexture, poseNet;
let nose, circleMask, angleOnCircle, myAvatarObj;

let videoOptions, preferredCam;
let poses = [];

//p5live
let people = {};  //make it an associatvie array with each person labeled by network id
let p5lm;
//

function setup() {
    myCanvas = createCanvas(512, 512);
    circleMask = createGraphics(512, 512);
    myCanvas.hide();
    createPullDownForCameraSelection();
    videoOptions = {
        audio: false, 
        video: {
            width: myCanvas.width,
            height: myCanvas.height,
            sourceId: preferredCam
        }
    }
    myVideo = createCapture(videoOptions);
    myVideo.hide();
    //const myVideo = document.getElementById('video');

    //p5lm
    //create the local thing
    creatNewVideoObject(myVideo, "me");
    //

    nose = { "x": myVideo.width / 2, "y": myVideo.height / 2 };
    poseNet = ml5.poseNet(myVideo, modelReady);
    poseNet.on("pose", gotPoses);

    init3D();
}


function modelReady() {
    console.log("model ready");
    progress = "loaded";
    poseNet.singlePose(myVideo);
}

// Show a pose (i.e. a person) only if probability more than 0.1
minPoseConfidence = 0.1;
// Show a body part only if probability more than 0.3
minPartConfidence = 0.3;


// A function that gets called every time there's an update from the model
function gotPoses(results) {
    //console.log(results);
    if (!results[0]) return;
    poses = results;
    progress = "predicting";
    let thisNose = results[0].pose.nose;
    let thisWrist = results[0].pose.rightWrist;

    let handRaised = false;
    if (thisWrist.confidence > .3 && thisWrist.y < height / 2) {
        handRaised = true;
    }
    // console.log(handRaised);
    if (thisNose.confidence > .8) {
        nose.x = thisNose.x;
        nose.y = thisNose.y;

        let xDiff = poses[0].pose.leftEye.x - poses[0].pose.rightEye.x;
        let yDiff = poses[0].pose.leftEye.y - poses[0].pose.rightEye.y;
        headAngle = Math.atan2(yDiff, xDiff);
        headAngle = THREE.Math.radToDeg(headAngle);

        if (headAngle > 15) {
            if (handRaised) {
                //move the camera
                lon -= .005;
                computeCameraOrientation();
            } else {
                //move p5sketch
                angleOnCircle -= 0.5;
                positionOnCircle(angleOnCircle, myAvatarObj);
            }
        }
        if (headAngle < -15) {
            if (handRaised) {
                //move the camera
                lon += .005;
                computeCameraOrientation();
            } else {
                //move p5sketch
                angleOnCircle += 0.5;
                positionOnCircle(angleOnCircle, myAvatarObj);
            }
        }


    }

}

function draw() {
    clear(); //clear the mask
    circleMask.ellipseMode(CENTER);
    circleMask.clear()//clear the mask
    circleMask.fill(0, 0, 0, 120);//set alpha of mask
    circleMask.noStroke();
    circleMask.ellipse(nose.x, nose.y, 150, 150)//use nose pos to draw alpha
    myVideo.mask(circleMask);//use alpha of mask to clip the vido
    image(myVideo, (myCanvas.width - myVideo.width) / 2, (myCanvas.height - myVideo.height) / 2);
    //image(myVideo, myVideo.width/2, myVideo.height/2);
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();


    //p5lm
    for(id in people){
        let thisPerson = people[id];
        if (thisPerson .videoObject.elt.readyState == thisPerson .videoObject.elt.HAVE_ENOUGH_DATA) {
            //check that the transmission arrived okay
            //then tell three that something has changed.
            thisPerson.texture.needsUpdate = true;
        }
    }
    //
 
  //drawSkeleton();
}

function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    var videoGeometry = new THREE.PlaneGeometry(512, 512);
    p5CanvasTexture = new THREE.Texture(myCanvas.elt);  //NOTICE THE .elt  this give the element
    let videoMaterial = new THREE.MeshBasicMaterial({ map: p5CanvasTexture, transparent: true, opacity: 1, side: THREE.DoubleSide });
    myAvatarObj = new THREE.Mesh(videoGeometry, videoMaterial);

    angleOnCircle = Math.PI;
    positionOnCircle(angleOnCircle, myAvatarObj);
    scene.add(myAvatarObj);


    video = document.getElementById( 'video' );
				video.play();
    //video.play();
    let bgGeometery = new THREE.SphereGeometry(900, 100, 40);
    //let bgGeometery = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
    bgGeometery.scale(-1, 1, 1);
    // has to be power of 2 like (4096 x 2048) or(8192x4096).  i think it goes upside down because texture is not right size
    //let panotexture = new THREE.TextureLoader().load("sand.jpg");
    let panotexture = new THREE.VideoTexture( video );
    // var material = new THREE.MeshBasicMaterial({ map: panotexture, transparent: true,   alphaTest: 0.02,opacity: 0.3});
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });

    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);
    scene.add(sphere);



    // let lmvideoGeometry = new THREE.PlaneGeometry(512, 512);
    // let lmmyTexture = new THREE.Texture(videoObject.elt);  //NOTICE THE .elt  this give the element
    // let lmvideoMaterial = new THREE.MeshBasicMaterial({ map: lmmyTexture, side: THREE.DoubleSide });
    // lmvideoMaterial.map.minFilter = THREE.LinearFilter;  //otherwise lots of power of 2 errors
    // lmmyAvatarObj = new THREE.Mesh(lmvideoGeometry, lmvideoMaterial);
    //creatNewVideoObject(videoObject, id);
    scene.add(lmmyAvatarObj);

    //they can move that around but we need to put you somewhere to start
    //angleOnCircle = positionOnCircle(null, lmmyAvatarObj);

    //remember a bunch of things about each connection in json but we are really only using texture in draw
    //use an named or associate array where each oject is labeled with an ID
    //people[id] = { "object": lmmyAvatarObj, "texture": lmmyTexture, "id": id, "videoObject": videoObject, "angleOnCircle": angleOnCircle };


    moveCameraWithMouse();

    camera3D.position.z = 0;
    animate();


}

//p5lm
function videoLoaded(stream) {
    p5lm = new p5LiveMedia(this, "CAPTURE", stream, "mycrazyroomname")
    p5lm.on('stream', gotStream);
    p5lm.on('data', gotData);
    p5lm.on('disconnect', gotDisconnect);
}

function gotData(data, id) {
    // If it is JSON, parse it
    let d = JSON.parse(data);
    positionOnCircle(d.angleOnCircle, people[id].object);
    if (d.loc.lat != myLoc.lat && d.loc.lng != myLoc.lng){
        console.log("in different places");
    }
}
function gotStream(videoObject, id) {
        //this gets called when there is someone else in the room, new or existing
        videoObject.hide();  //don't want the dom object, will use in p5 and three.js instead
        //get a network id from each person who joins
        creatNewVideoObject(videoObject, id);
    }

    function gotDisconnect(id) {
        people[id].videoObject.remove(); //dom version
        scene.remove(people[id].object); //three.js version
        delete people[id];  //remove from our variable
    }
    
    function creatNewVideoObject(videoObject, id) {  //this is for remote and local
        var lmvideoGeometry = new THREE.PlaneGeometry(512, 512);
        let lmmyTexture = new THREE.Texture(videoObject.elt);  //NOTICE THE .elt  this give the element
        let lmvideoMaterial = new THREE.MeshBasicMaterial({ map: lmmyTexture, side: THREE.DoubleSide });
        lmvideoMaterial.map.minFilter = THREE.LinearFilter;  //otherwise lots of power of 2 errors
        lmmyAvatarObj = new THREE.Mesh(lmvideoGeometry, lmvideoMaterial);
    
        //scene.add(lmmyAvatarObj);
    
        //they can move that around but we need to put you somewhere to start
        angleOnCircle = positionOnCircle(null, lmmyAvatarObj);
    
        //remember a bunch of things about each connection in json but we are really only using texture in draw
        //use an named or associate array where each oject is labeled with an ID
        people[id] = { "object": lmmyAvatarObj, "texture": lmmyTexture, "id": id, "videoObject": videoObject, "angleOnCircle": angleOnCircle };
    
    }
    
    function positionOnCircle(angle, thisAvatar) {
        //position it on a circle around the middle
        if (angle == null) { //first time
            angle = random(2*Math.PI); 
        }
          //imagine a circle looking down on the world and do High School math
        let distanceFromCenter = 800;
        x = distanceFromCenter * Math.sin(angle);
        z = distanceFromCenter * Math.cos(angle);
        thisAvatar.position.set(x, 0, z);  //zero up and down
        thisAvatar.lookAt(0, 0, 0);  //oriented towards the camera in the center
        return angle;
    }
    function keyPressed() {
        let me = people["me"];
        if (keyCode == 37 || key == "a") {
            me.angleOnCircle -= .01;
    
        } else if (keyCode == 39 || key == "d") {
            me.angleOnCircle += .01;
        
    
        } else if (keyCode == 38 || key == "w") {
    
        } else if (keyCode == 40 || key == "s") {
    
        }
        positionOnCircle(me.angleOnCircle, me.object); //change it locally 
        //send it to others
        let dataToSend = { "angleOnCircle": me.angleOnCircle};
        p5lm.send(JSON.stringify(dataToSend));
    
    }
    

  function positionOnCircle(angle, mesh) {
    //imagine a circle looking down on the world and do High School math
    let distanceFromCenter = 850;
    x = distanceFromCenter * Math.sin(angle);
    z = distanceFromCenter * Math.cos(angle);
    mesh.position.set(x, 0, z);
    mesh.lookAt(0, 0, 0);
}

function animate() {
    requestAnimationFrame(animate);
    p5CanvasTexture.needsUpdate = true;  //tell renderer that P5 canvas is changing
    renderer.render(scene, camera3D);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
      // For each pose detected, loop through all the keypoints
      const pose = poses[i].pose;
      for (let j = 0; j < pose.keypoints.length; j += 1) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        const keypoint = pose.keypoints[j];
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.2) {
          fill(255, 0, 0);
          noStroke();
          //ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          image(myVideo, keypoint.position.x, keypoint.position.y, 150, 150);
        }
      }
    }
  }


























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






// -------------------------------------
// Creating Tracker class
// function Tracker(){
//     this.position = new THREE.Vector3();
  
//     let geometry = new THREE.SphereGeometry(100,7,7);
//     //const geometry = new THREE.PlaneGeometry(520, 520);
//     //const geometry = new THREE.TorusKnotGeometry( 100, 30, 10, 160 );
//     //const geometry = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true);
//     //const texture = new THREE.Texture(video.elt);
//     let texture = new THREE.VideoTexture( myVideo.elt );
//     // const material = new THREE.MeshToonMaterial({
//     //                                             color: 0xEFF6EE, 
//     //                                             opacity:0.5, 
//     //                                             transparent:true, 
//     //                                             wireframe:true, 
//     //                                             emissive: 0xEFF6EE,
//     //                                             emissiveIntensity:1});
//     let basicmaterial = new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide});
//     basicmaterial.map.minFilter = THREE.LinearFilter;                                      
  
//     //const sphere = new THREE.Mesh(geometry, material);
//     let sphere = new THREE.Mesh(geometry, basicmaterial);
//     //group.add(sphere);
  
  
//     this.initialise = function() {
//       this.position.x = -10;
//       this.position.y = -10;
//       this.position.z = 0;
//     }
  
//     this.update = function(x,y,z){
//       this.position.x = x;
//       this.position.y = y;
//       this.position.z = z;
//     }
  
//     this.display = function() {
//       sphere.position.x = this.position.x;
//       sphere.position.y = this.position.y;
//       sphere.position.z = this.position.z;
  
//       // console.log(sphere.position);
//     }
//   }
  

//   // Initialise trackers to attach to body parts recognised by posenet model

// let trackers = [];

// for (let i=0; i<17; i++){
//   let tracker = new Tracker();
//   tracker.initialise();
//   tracker.display();

//   trackers.push(tracker);
// }
// poses.forEach(({score, keypoints}) => {
//     if (score >= minPoseConfidence) {
//       keypoints.forEach((d,i)=>{
//         if(d.score>minPartConfidence){
//         // console.log(d.part);
//         // Positions need some scaling
//         trackers[i].update(-d.position.x+width, d.position.y,0);
//         trackers[i].display();
//         }
//         // Move out of screen if body part not detected
//         else if(d.score<minPartConfidence){
//         trackers[i].update(-10,-10,0);
//         trackers[i].display();
//         }
//       })
//     }
//   });
  // -------------------------------------
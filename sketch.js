let cam, cam_h, cam_x, cam_y, cam_x_goal, cam_look_y;
let lastAngle_base, lastAngle_pri, lastAngle_sec;
let pri_spinner_goal, sec_spinner_goal;
let pointer_width;
let isEnd, isIdle;
let font;
let isMint, isBuild, isCreateMeme, isCreateNFT, isSell;
let sec_spinner;
let pri_spinner_slice, sec_spinner_slice;
let max_goal;

const compassWidth = 400;
const compassHeight = 600;
const center = { x: 0, y: 0 };
const white = "white";
const blue = [221, 100, 50];
const base_goal = 1440;
const threshold = 0.01;
const pri_spinner_d = 150;
const sec_spinner_d = 130;
const pri_spinner = [
  "Mint NFT",
  "Send ETH",
  "BUILD",
  "Create Meme",
  "Create NFT",
  "Sell NFT",
  "Bridge",
  "Buy ETH",
  "Buy USDC",
  "Swap",
];

function preload() {
  font = loadFont("assets/CoinbaseMono-Regular.a6d16aa3.ttf");
}

function setup() {
  createCanvas(compassWidth, compassHeight, WEBGL);

  frameRate(60);
  pixelDensity(4);
  colorMode(HSL, 360, 100, 100, 100);
  angleMode(DEGREES);

  textAlign(CENTER, CENTER);
  textFont(font);
  textSize(8);

  noStroke();
  fill(white);

  cam = createCamera();

  isIdle = true;
  pri_spinner_slice = 360 / pri_spinner.length;

  scaleCanvas();
  resetCompass();
}

function draw() {
  background(blue);

  if (
    pri_spinner_goal - lastAngle_pri < 1 &&
    sec_spinner_goal - lastAngle_sec < 1
  ) {
    if (!isEnd) isEnd = true;
    showClickToRestart();
  }

  if (isIdle) showClickToStart();

  // Handle Camera
  let new_cam_h = isIdle
    ? cam_h
    : isEnd
    ? lerp(cam_h, 200, 0.05)
    : lerp(cam_h, 75, 0.03);

  let new_look_y = isIdle
    ? cam_look_y
    : isEnd
    ? lerp(cam_look_y, -150, 0.05)
    : lerp(cam_look_y, -150, 0.015);

  let new_cam_x = isIdle
    ? cam_x
    : isEnd
    ? lerp(cam_x, 0, 0.05)
    : lerp(cam_x, cam_x_goal, 0.02);

  let new_cam_y = isIdle
    ? cam_y
    : isEnd
    ? lerp(cam_y, -150, 0.05)
    : lerp(cam_y, 0, 0.05);

  cam.setPosition(new_cam_x, new_cam_y, new_cam_h);
  cam.lookAt(0, new_look_y, 0);

  cam_x = new_cam_x;
  cam_y = new_cam_y;
  cam_h = new_cam_h;
  cam_look_y = new_look_y;

  drawSpinnerBorders();

  // Rotate to North
  rotate(-90);

  // Draw Primary Spinner
  {
    let newAngle = isIdle
      ? frameCount / 3
      : lerp(lastAngle_pri, pri_spinner_goal, 0.04);

    if (pri_spinner_goal - newAngle < threshold && !isIdle)
      newAngle = pri_spinner_goal;

    push();
    rotate(newAngle);
    drawSpinner(pri_spinner_slice, pri_spinner, pri_spinner_d);
    pop();

    lastAngle_pri = !isIdle ? newAngle : 0;
  }

  // Draw secondary spinner
  {
    let newAngle = isIdle
      ? frameCount / 3
      : lerp(lastAngle_sec, sec_spinner_goal, 0.04);

    if (sec_spinner_goal - newAngle < threshold && !isIdle)
      newAngle = sec_spinner_goal;

    push();
    rotate(newAngle * -1);
    drawSpinner(sec_spinner_slice, sec_spinner, sec_spinner_d);
    pop();

    lastAngle_sec = !isIdle ? newAngle : 0;
  }

  // Draw Base compass
  {
    let newAngle = isIdle ? frameCount : lerp(lastAngle_base, base_goal, 0.05);
    if (base_goal - newAngle < threshold && !isIdle) newAngle = base_goal;

    rotate(newAngle);

    lastAngle_base = !isIdle ? newAngle : 0;

    const diff = max_goal - Math.max(lastAngle_pri, lastAngle_sec);

    if (diff < 1800) {
      const rY = !isIdle ? sin(diff) * 1.2 : 0;
      rotateY(rY);
    }

    let new_pointer_width = isIdle
      ? pointer_width
      : lerp(pointer_width, 50, 0.01);

    if (new_pointer_width - 50 < threshold && !isIdle) new_pointer_width = 50;

    drawBase(center, 220, white, blue, new_pointer_width);

    pointer_width = new_pointer_width;
  }
}

function mouseClicked() {
  if (isIdle == false) resetCompass();
  isIdle = !isIdle;
}

function getRandomPrimaryGoal(_slice, _goals) {
  const ind = Math.floor(Math.random() * _goals.length);

  if (_goals[ind] === "Mint NFT") isMint = true;
  if (_goals[ind] === "Create Meme") isCreateMeme = true;
  if (_goals[ind] === "BUILD") isBuild = true;
  if (_goals[ind] === "Sell NFT") isSell = true;
  if (_goals[ind] === "Create NFT") isCreateNFT = true;

  return 360 - _slice * ind + Math.floor(Math.random() * 500) * 360;
}

function getRandomSecondaryGoal(_slice, _goals) {
  const ind = Math.floor(Math.random() * _goals.length);
  return _slice * ind + Math.floor(Math.random() * 500) * 360;
}

function drawSpinner(_slice, _goals, _r) {
  for (let i = 0; i < _goals.length; i++) {
    const x = center.x + _r * cos(i * _slice);
    const y = center.y + _r * sin(i * _slice);
    push();
    translate(x, y);
    fill(isEnd ? [55, 100, 60] : white);
    rotate(_slice * i + 90);
    text(_goals[i], 0, 0);
    pop();
  }
}

function drawBase(_center, d, col, bg, w) {
  w ??= d;

  push();
  fill(col);
  perfectCircle(_center.x, _center.y, d);
  fill(bg);
  translate(0, 0, 0.2);
  rect(_center.x - d * 0.1, _center.y - w / 24, d / 1.6, w / 12);
  pop();
}

function drawSpinnerBorders() {
  push();
  noFill();
  strokeWeight(0.5);
  stroke(white);
  perfectCircle(0, 0, 320, 320);
  perfectCircle(0, 0, 280);
  perfectCircle(0, 0, 240);
  pop();
}

function resetCompass() {
  isMint = false;
  isSell = false;
  isCreateMeme = false;
  isCreateNFT = false;
  isEnd = false;
  lastAngle_base = 0;
  lastAngle_pri = 0;
  lastAngle_sec = 0;
  pointer_width = 200;
  cam_h = 800;
  cam_y = 500;
  cam_x = 0;
  cam_x_goal = random(-50, 50);
  cam_look_y = 0;

  pri_spinner_goal = getRandomPrimaryGoal(pri_spinner_slice, pri_spinner);

  sec_spinner = (() => {
    if (isCreateMeme) {
      return ["on IG", "on X", "on Farcaster"];
    }
    if (isSell) {
      return ["on Zora", "on OP", "on Base", "on Opensea", "on Element"];
    }
    if (isCreateNFT) {
      return [
        "on Zora",
        "on OP",
        "on Base",
        "on Opensea",
        "on HIGHLIGHT",
        "on Coop rec.",
      ];
    }
    if (isMint) {
      return [
        "on Zora",
        "on OP",
        "on Base",
        "on Opensea",
        "on HIGHLIGHT",
        "on Coop rec.",
        "on Mint.fun",
      ];
    }

    return ["on Zora", "on OP", "on Base"];
  })();

  sec_spinner_slice = 360 / sec_spinner.length;
  sec_spinner_goal = getRandomSecondaryGoal(sec_spinner_slice, sec_spinner);

  max_goal = Math.max(sec_spinner_goal, pri_spinner_goal);
}

function showClickToStart() {
  push();
  textSize(20);
  text("Click", 0, 200);
  text("to get daily insight", 0, 225);
  pop();
}

function showClickToRestart() {
  push();
  textSize(5);
  text("Click", 0, -200);
  text("to get another!", 0, -195);
  pop();
}

function perfectCircle(x, y, r) {
  arc(x, y, r, r, 0, 90);
  arc(x, y, r, r, 90, 180);
  arc(x, y, r, r, 180, 3 * 90);
  arc(x, y, r, r, 3 * 90, 360);
}

function windowResized() {
  scaleCanvas();
}

function scaleCanvas() {
  const compassAspectRatio = compassHeight / compassWidth;
  const canvasElement = document.querySelector("#defaultCanvas0");

  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;

  if (innerHeight <= innerWidth * compassAspectRatio) {
    canvasElement.style.height = "100%";
    canvasElement.style.width = "auto";
  } else {
    canvasElement.style.width = "100%";
    canvasElement.style.height = "auto";
  }
}

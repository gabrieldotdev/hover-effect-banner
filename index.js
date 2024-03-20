const body = document.getElementById("app");
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

import bannersData from "./config.js";
let allImagesData = bannersData[0].data;

let compensate = 0;
let layers = [];

// Thêm sự kiện click cho các mục trong selectBox
document.getElementById("selectBox").addEventListener("click", (e) => {
  const setData = bannersData[+e.target.id];
  if (!setData) return;
  allImagesData = setData.data;
  body.innerHTML = "";
  layers = [];
  initItems();
});

// Hàm khởi tạo các phần tử hình ảnh
function initItems() {
  compensate = Math.max(window.innerWidth / 1650, 1);
  if (layers.length <= 0) {
    const cloneData = JSON.parse(JSON.stringify(allImagesData));
    body.style.display = "none";
    cloneData.forEach((item) => {
      const layer = document.createElement("div");
      layer.classList.add("layer");
      item.transform[4] *= compensate;
      item.transform[5] *= compensate;
      layer.style.transform = `matrix(${item.transform.join(",")})`;
      if (item.opacity) layer.style.opacity = item.opacity[0];
      const child = document.createElement(item.tagName || "img");
      if (item.tagName === "video") {
        child.loop = true;
        child.autoplay = true;
        child.muted = true;
      }
      child.src = item.src;
      child.style.filter = `blur(${item.blur}px)`;
      child.style.width = `${item.width * compensate}px`;
      child.style.height = `${item.height * compensate}px`;
      layer.appendChild(child);
      body.appendChild(layer);
    });
    body.style.display = "";
    layers = document.querySelectorAll(".layer");
  } else {
    const cloneData = JSON.parse(JSON.stringify(allImagesData));
    layers.forEach((layer, i) => {
      const item = cloneData[i];
      item.transform[4] *= compensate;
      item.transform[5] *= compensate;
      layer.firstElementChild.style.width = `${item.width * compensate}px`;
      layer.firstElementChild.style.height = `${item.height * compensate}px`;
      layer.style.transform = `matrix(${item.transform.join(",")})`;
    });
  }
}

initItems();

let initX = 0;
let moveX = 0;
let startTime = 0;
const duration = 200;

function mouseMove() {
  animate();
}

function leave() {
  startTime = 0;
  requestAnimationFrame(homing);
}

function homing(timestamp) {
  !startTime && (startTime = timestamp);
  const elapsed = timestamp - startTime;
  const progress = Math.min(elapsed / duration, 1);
  animate(progress);
  progress < 1 && requestAnimationFrame(homing);
}

function animate(progress) {
  if (layers.length <= 0) return;
  const isHoming = typeof progress === "number";
  layers.forEach((layer, i) => {
    const item = allImagesData[i];
    let m = new DOMMatrix(item.transform);
    let move = moveX * item.a;
    let s = item.f ? item.f * moveX + 1 : 1;
    let g = moveX * (item.g || 0);
    if (isHoming) {
      m.e = lerp(
        moveX * item.a + item.transform[4],
        item.transform[4],
        progress
      );
      move = 0;
      s = lerp(item.f ? item.f * moveX + 1 : 1, 1, progress);
      g = lerp(item.g ? item.g * moveX : 0, 0, progress);
    }
    m = m.multiply(new DOMMatrix([m.a * s, m.b, m.c, m.d * s, move, g]));
    if (item.deg) {
      const deg = isHoming
        ? lerp(item.deg * moveX, 0, progress)
        : item.deg * moveX;
      m = m.multiply(
        new DOMMatrix([
          Math.cos(deg),
          Math.sin(deg),
          -Math.sin(deg),
          Math.cos(deg),
          0,
          0,
        ])
      );
    }
    if (item.opacity) {
      layer.style.opacity =
        isHoming && moveX > 0
          ? lerp(item.opacity[1], item.opacity[0], progress)
          : lerp(
              item.opacity[0],
              item.opacity[1],
              (moveX / window.innerWidth) * 2
            );
    }
    layer.style.transform = m;
  });
}

body.addEventListener("mouseenter", (e) => {
  initX = e.pageX;
});

body.addEventListener("mousemove", (e) => {
  moveX = e.pageX - initX;
  requestAnimationFrame(mouseMove);
});

body.addEventListener("mouseleave", leave);

window.onblur = leave;

window.addEventListener("resize", initItems);

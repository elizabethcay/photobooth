let video, videoContainer, startButton, downloadButton, countdown, imageStrip;

function initializeElements() {
  video = document.getElementById("video");
  videoContainer = document.getElementById("video-container");
  startButton = document.getElementById("start");
  downloadButton = document.getElementById("download");
  countdown = document.getElementById("countdown");
  imageStrip = document
    .getElementById("image-strip")
    .getElementsByTagName("img");
}

async function initCamera() {
  try {
    videoContainer.innerHTML =
      '<div class="loading-text">requesting camera access...</div>';

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
    });

    videoContainer.innerHTML =
      '<video id="video" autoplay muted playsinline></video><div id="countdown" class="countdown">3</div>';

    video = document.getElementById("video");
    countdown = document.getElementById("countdown");

    video.srcObject = stream;

    console.log("Camera initialized successfully!");
  } catch (error) {
    console.error("Camera access denied:", error);
    videoContainer.innerHTML =
      '<div class="loading-text">camera access denied. please refresh and allow camera access.</div>';
  }
}

async function captureImages() {
  startButton.disabled = true;
  startButton.textContent = "Capturing...";

  try {
    for (let i = 0; i < 4; i++) {
      await startCountdown();

      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Video not ready");
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      if (imageStrip[i]) {
        imageStrip[i].src = canvas.toDataURL("image/png");
        console.log(`Image ${i + 1} captured`);
      }

      if (i < 3) await new Promise((resolve) => setTimeout(resolve, 500));
    }

    downloadButton.disabled = false;
    console.log("All images captured successfully");
  } catch (error) {
    console.error("Error capturing images:", error);
    alert("Error capturing images. Please try again.");
  } finally {
    startButton.disabled = false;
    startButton.textContent = "capture";
  }
}

function startCountdown() {
  return new Promise((resolve) => {
    if (!countdown) {
      resolve();
      return;
    }

    countdown.style.display = "block";
    let count = 3;
    countdown.textContent = count;

    const interval = setInterval(() => {
      count--;
      countdown.textContent = count === 0 ? "📸" : count;

      if (count <= 0) {
        setTimeout(() => {
          clearInterval(interval);
          countdown.style.display = "none";
          resolve();
        }, 300);
      }
    }, 1000);
  });
}

function downloadImages() {
  const capturedImages = [];
  for (let i = 0; i < 4; i++) {
    if (
      imageStrip[i] &&
      imageStrip[i].src &&
      !imageStrip[i].src.includes("data:")
    ) {
    }
    if (
      imageStrip[i] &&
      imageStrip[i].src &&
      imageStrip[i].src.startsWith("data:")
    ) {
      capturedImages.push(i);
    }
  }

  if (capturedImages.length === 0) {
    alert("No images captured yet. Please capture some photos first!");
    return;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const firstImg = new Image();
  firstImg.onload = function () {
    const imageWidth = this.naturalWidth;
    const imageHeight = this.naturalHeight;

    const padding = 20;
    canvas.width = imageWidth + padding * 2;
    canvas.height = imageHeight * 4 + padding * 5;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let loadedImages = 0;
    const images = [];

    capturedImages.forEach((index) => {
      const tempImg = new Image();
      tempImg.onload = function () {
        images[index] = this;
        loadedImages++;

        if (loadedImages === capturedImages.length) {
          for (let j = 0; j < 4; j++) {
            if (images[j]) {
              const y = padding + j * (imageHeight + padding);
              context.drawImage(images[j], padding, y, imageWidth, imageHeight);
            }
          }

          const a = document.createElement("a");
          a.href = canvas.toDataURL("image/png");
          a.download = `Photo Strip.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          console.log("Photo strip downloaded");
        }
      };
      tempImg.src = imageStrip[index].src;
    });
  };

  firstImg.src = imageStrip[capturedImages[0]].src;
}

window.addEventListener("load", () => {
  initializeElements();
  initCamera();

  startButton.addEventListener("click", captureImages);
  downloadButton.addEventListener("click", downloadImages);

  downloadButton.disabled = true;

  console.log("Photo booth initialized");
});

import {
  grayscale,
  threshold,
  boxblur,
  sharpening,
  unsharpmasking,
  laplacian,
  sobel,
  multiply_channels,
  bucket_channels,
  cut_from_to,
} from "./filters.js";

import {
  cut_onmousedown,
  cut_onmouseup,
  cut_onmousemove,
  copy_onmousedown,
  rectangle_onmousedown,
  rectangle_onmousemove,
  rectangle_onmouseup,
  brush_onmousedown,
  brush_onmousemove,
  brush_onmouseup,
} from "./tools.js";

const main = document.getElementById("main_content");
const file_input = document.getElementById("file_input");
const start_file_input = document.getElementById("start_file_input");
const original_image = document.getElementById("original_image");
const canvas = document.getElementById("filtered_image");
const overlay = document.getElementById("overlay");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const overlay_ctx = overlay.getContext("2d", { willReadFrequently: true });
const filterbuttons = document.getElementsByClassName("filter_button");
const toggle_original_btn = document.getElementById("toggle_original_btn");
const revert_btn = document.getElementById("revert_btn");
const toolbuttons = document.getElementsByClassName("tool_btn");
const color_picker = document.getElementById("color_picker");
const brush_size_picker = document.getElementById("brush_size_picker");
const download_btn = document.getElementById("download_btn");

let imageSize = null;

let selection = {
  holding: false,
  active: false,
  x1: 0,
  x2: 0,
  y1: 0,
  y2: 0,
  pixels: null,
  image_data: null,
  grab_point: null,
};

let current_tool = {
  move: null,
  click: null,
  up: null,
};

let image_data = null;
let pixels = null;

let color = color_picker.value;
let brush_size = brush_size_picker.value;

overlay.onmousedown = (e) => {
  if (current_tool.click == null) return;
  let mouseX = e.offsetX * imageSize.ratioW;
  let mouseY = e.offsetY * imageSize.ratioW;
  console.log(imageSize);
  current_tool.click(
    mouseX,
    mouseY,
    selection,
    overlay_ctx,
    original_image,
    ctx,
    image_data,
    overlay,
    pixels,
    color,
    brush_size
  );
  image_data = ctx.getImageData(
    0,
    0,
    original_image.naturalWidth,
    original_image.naturalHeight
  );
  pixels = image_data.data;
};
overlay.onmouseup = (e) => {
  if (current_tool.up == null) return;
  let mouseX = e.offsetX * imageSize.ratioW;
  let mouseY = e.offsetY * imageSize.ratioW;
  current_tool.up(
    mouseX,
    mouseY,
    selection,
    overlay_ctx,
    original_image,
    ctx,
    image_data,
    overlay,
    pixels,
    color,
    brush_size
  );
  image_data = ctx.getImageData(
    0,
    0,
    original_image.naturalWidth,
    original_image.naturalHeight
  );
  pixels = image_data.data;
};
overlay.onmousemove = (e) => {
  if (current_tool.move == null) return;
  let mouseX = e.offsetX * imageSize.ratioW;
  let mouseY = e.offsetY * imageSize.ratioW;
  current_tool.move(
    mouseX,
    mouseY,
    selection,
    overlay_ctx,
    original_image,
    ctx,
    image_data,
    overlay,
    pixels,
    color,
    brush_size
  );
  image_data = ctx.getImageData(
    0,
    0,
    original_image.naturalWidth,
    original_image.naturalHeight
  );
  pixels = image_data.data;
};

[...filterbuttons].forEach((e) => {
  e.onclick = (e) => {
    const filter_name = e.target.getAttribute("data-filter_name");
    filter(filter_name);
  };
});

[...toolbuttons].forEach((e) => {
  e.onclick = (e) => {
    const tool_name = e.target.getAttribute("data-tool_name");
    select_tool(tool_name);
  };
});

toggle_original_btn.onclick = () => {
  if (original_image.classList.contains("hidden")) {
    original_image.classList.remove("hidden");
    canvas.classList.add("hidden");
    overlay.classList.add("hidden");
  } else {
    original_image.classList.add("hidden");
    canvas.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }
};

revert_btn.onclick = () => {
  ctx.drawImage(
    original_image,
    0,
    0,
    original_image.naturalWidth,
    original_image.naturalHeight
  );
  image_data = ctx.getImageData(
    0,
    0,
    original_image.naturalWidth,
    original_image.naturalHeight
  );
  pixels = image_data.data;
  original_image.classList.add("hidden");
  canvas.classList.remove("hidden");
  overlay.classList.remove("hidden");
  refresh_histogram(pixels, original_image.naturalWidth);
};

const input_onchange_function = (e) => {
  console.log(e);
  if (e.target.value == "") return;
  start_file_input.classList.add("hidden");
  main.classList.remove("hidden");
  original_image.src = URL.createObjectURL(e.target.files[0]);
  e.target.value = "";
  original_image.onload = () => {
    overlay.height = canvas.height = original_image.naturalHeight;
    overlay.width = canvas.width = original_image.naturalWidth;

    ctx.drawImage(
      original_image,
      0,
      0,
      original_image.naturalWidth,
      original_image.naturalHeight
    );

    canvas.classList.remove("hidden");
    overlay.classList.remove("hidden");

    image_data = ctx.getImageData(
      0,
      0,
      original_image.naturalWidth,
      original_image.naturalHeight
    );
    pixels = image_data.data;

    imageSize = {
      w: original_image.naturalWidth,
      h: original_image.naturalHeight,
    };

    if (imageSize.w > 700) imageSize.w = 700;
    else if (imageSize.w < 250) imageSize.w = 250;
    if (imageSize.h > 700) imageSize.h = 700;
    else if (imageSize.h < 250) imageSize.h = 250;

    imageSize.ratioW = original_image.naturalWidth / imageSize.w;
    imageSize.ratioH = original_image.naturalHeight / imageSize.h;

    refresh_histogram(pixels, original_image.naturalWidth);

    download_btn.onclick = (e) => {
      window.open(canvas.toDataURL(), "_blank");
    };
  };
};

file_input.onchange = (e) => {
  input_onchange_function(e);
};
start_file_input.onchange = (e) => {
  input_onchange_function(e);
};

color_picker.onchange = (e) => {
  color = e.target.value;
};

brush_size_picker.onchange = (e) => {
  brush_size = e.target.value;
};

function filter(type) {
  if (original_image.src == "") return;
  original_image.classList.add("hidden");
  canvas.classList.remove("hidden");
  overlay.classList.remove("hidden");

  switch (type) {
    case "grayscale":
      grayscale(pixels);
      break;
    case "threshold":
      threshold(pixels, 128);
      break;
    case "boxblur":
      boxblur(
        pixels,
        original_image.naturalWidth,
        original_image.naturalHeight
      );
      break;
    case "sharpening":
      sharpening(pixels, original_image.naturalWidth);
      break;
    case "unsharpmasking":
      unsharpmasking(pixels, original_image.naturalWidth);
      break;
    case "laplacian":
      laplacian(pixels, original_image.naturalWidth);
      break;
    case "sobel":
      sobel(pixels, original_image.naturalWidth);
      break;
    case "multiplyingchannels":
      let r = document.getElementById("multiply_red_channel_input");
      let g = document.getElementById("multiply_green_channel_input");
      let b = document.getElementById("multiply_blue_channel_input");
      multiply_channels(
        pixels,
        Number(r.value),
        Number(g.value),
        Number(b.value)
      );
      break;
  }

  ctx.putImageData(image_data, 0, 0);
  refresh_histogram(pixels);
}

function refresh_histogram(pixels) {
  const buckets = bucket_channels(pixels, 255);
  console.log(buckets);
  const chart = new CanvasJS.Chart("histogram", {
    axisX: {
      title: "Buckets",
      fontColor: "#fff",
      titleFontColor: "#fff",
      labelFontColor: "#fff",
      tickColor: "#fff",
    },
    axisY2: {
      title: "Histogram",
      titleFontColor: "#fff",
      lineColor: "#fff",
      labelFontColor: "#fff",
      tickColor: "#fff",
      fontColor: "#fff",
    },
    data: [
      {
        type: "line",
        axisYType: "secondary",
        name: "red",
        color: "red",
        dataPoints: buckets["R"],
      },
      {
        type: "line",
        name: "green",
        legendText: "green",
        color: "green",
        dataPoints: buckets["G"],
      },
      {
        type: "line",
        name: "blue",
        legendText: "blue",
        color: "blue",
        dataPoints: buckets["B"],
      },
    ],
  });

  chart.render();
}

function select_tool(tool) {
  selection = {
    holding: false,
    active: false,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    pixels: null,
    image_data: null,
    grab_point: null,
  };
  overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
  switch (tool) {
    case "cut":
      current_tool.click = cut_onmousedown;
      current_tool.move = cut_onmousemove;
      current_tool.up = cut_onmouseup;
      break;
    case "copy":
      current_tool.click = copy_onmousedown;
      current_tool.move = cut_onmousemove;
      current_tool.up = cut_onmouseup;
      break;
    case "brush":
      current_tool.click = brush_onmousedown;
      current_tool.move = brush_onmousemove;
      current_tool.up = brush_onmouseup;
      break;
    case "rectangle":
      current_tool.click = rectangle_onmousedown;
      current_tool.move = rectangle_onmousemove;
      current_tool.up = rectangle_onmouseup;
      break;
  }
}

select_tool("cut");

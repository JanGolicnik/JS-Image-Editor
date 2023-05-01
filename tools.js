function is_in_range(value, rangeStart, rangeEnd) {
  var min = Math.min(rangeStart, rangeEnd);
  var max = Math.max(rangeStart, rangeEnd);
  return value >= min && value <= max;
}

export function cut_onmousemove(
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
) {
  if (selection.holding) {
    overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
    overlay_ctx.putImageData(
      selection.image_data,
      mouseX + selection.grab_point.x,
      mouseY + selection.grab_point.y
    );
  } else if (selection.active) {
    overlay_ctx.setLineDash([5, 5]);
    overlay_ctx.strokeStyle = "#ff0000";
    overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
    overlay_ctx.beginPath();
    selection.x2 = mouseX;
    selection.y2 = mouseY;
    overlay_ctx.rect(
      selection.x1,
      selection.y1,
      selection.x2 - selection.x1,
      selection.y2 - selection.y1
    );
    overlay_ctx.stroke();
  }
}

export function cut_onmouseup(
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
) {
  if (selection.holding) {
    ctx.putImageData(
      selection.image_data,
      mouseX + selection.grab_point.x,
      mouseY + selection.grab_point.y
    );
    overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);

    selection.x1 = 0;
    selection.x2 = 0;
    selection.y1 = 0;
    selection.y2 = 0;
  }
  selection.active = false;
  selection.holding = false;
}

export function cut_onmousedown(
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
) {
  if (
    is_in_range(mouseX, selection.x1, selection.x2) &&
    is_in_range(mouseY, selection.y1, selection.y2)
  ) {
    selection.image_data = ctx.getImageData(
      selection.x1,
      selection.y1,
      selection.x2 - selection.x1,
      selection.y2 - selection.y1
    );
    selection.holding = true;
    selection.grab_point = {
      x: Math.min(selection.x1, selection.x2) - mouseX,
      y: Math.min(selection.y1, selection.y2) - mouseY,
    };
    ctx.fillStyle = "white";
    ctx.fillRect(
      selection.x1,
      selection.y1,
      selection.x2 - selection.x1,
      selection.y2 - selection.y1
    );
    overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
  } else {
    selection.x1 = mouseX;
    selection.y1 = mouseY;
    selection.active = true;
  }
}

export function copy_onmousedown(
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
) {
  if (
    is_in_range(mouseX, selection.x1, selection.x2) &&
    is_in_range(mouseY, selection.y1, selection.y2)
  ) {
    selection.image_data = ctx.getImageData(
      selection.x1,
      selection.y1,
      selection.x2 - selection.x1,
      selection.y2 - selection.y1
    );
    selection.holding = true;
    selection.grab_point = {
      x: Math.min(selection.x1, selection.x2) - mouseX,
      y: Math.min(selection.y1, selection.y2) - mouseY,
    };
    overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
  } else {
    selection.x1 = mouseX;
    selection.y1 = mouseY;
    selection.active = true;
  }
}

export function rectangle_onmousemove(
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
) {
  if (!selection.active) return;
  overlay_ctx.setLineDash([5, 5]);
  overlay_ctx.fillStyle = color;
  overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
  overlay_ctx.beginPath();
  selection.x2 = mouseX;
  selection.y2 = mouseY;
  overlay_ctx.fillRect(
    selection.x1,
    selection.y1,
    selection.x2 - selection.x1,
    selection.y2 - selection.y1
  );
  overlay_ctx.stroke();
}

export function rectangle_onmouseup(
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
) {
  if (!selection.active) return;
  ctx.fillStyle = color;
  ctx.fillRect(
    selection.x1,
    selection.y1,
    selection.x2 - selection.x1,
    selection.y2 - selection.y1
  );

  overlay_ctx.clearRect(0, 0, overlay.width, overlay.height);
  selection.x1 = 0;
  selection.x2 = 0;
  selection.y1 = 0;
  selection.y2 = 0;
  selection.active = false;
}

export function rectangle_onmousedown(
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
) {
  selection.x1 = mouseX;
  selection.y1 = mouseY;
  selection.active = true;
}

export function brush_onmousedown(
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
) {
  selection.active = true;
  selection.x1 = mouseX;
  selection.y1 = mouseY;
}

export function brush_onmousemove(
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
) {
  if (!selection.active) return;

  selection.x2 = mouseX;
  selection.y2 = mouseY;

  ctx.strokeStyle = color;
  ctx.lineWidth = brush_size;
  ctx.beginPath();
  ctx.moveTo(selection.x1, selection.y1);
  ctx.lineTo(selection.x2, selection.y2);
  ctx.stroke();
  selection.x1 = selection.x2;
  selection.y1 = selection.y2;
}

export function brush_onmouseup(
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
) {
  selection.active = false;

  selection.x1 = selection.x2 = selection.y1 = selection.y2 = 0;
}

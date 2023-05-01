export function grayscale(data) {
  for (let i = 0; i < data.length; i += 4) {
    const val = 0.299 * data[i] + 0.587 * data[i] + 0.114 * data[i];
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    continue;
  }
}

export function threshold(data, threshold) {
  for (let i = 0; i < data.length; i += 4) {
    let val = 0.299 * data[i] + 0.587 * data[i] + 0.114 * data[i];
    val = val > threshold ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    continue;
  }
}

function getIndex(middle, x_offset, y_offset, image_width, image_height) {
  let x = middle == 0 ? 0 : middle % image_width;
  let y = Math.floor(middle / image_width);

  x += x_offset;
  y += y_offset;

  if (x < 0) x = 0;
  if (x > image_width - 1) x = image_width - 1;

  if (y < 0) y = 0;
  if (y > image_height - 1) y = image_height - 1;

  return x + y * image_width;
}

export function apply_matrix(
  data,
  image_width,
  image_height,
  matrix,
  divideby
) {
  const unmodified_data = [...data];
  for (let i = 0; i < data.length; i += 4) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        const index = getIndex(
          Math.floor(i / 4),
          x,
          y,
          image_width,
          image_height
        );
        r += matrix[x + 1 + (y + 1) * 3] * unmodified_data[index * 4];
        g += matrix[x + 1 + (y + 1) * 3] * unmodified_data[index * 4 + 1];
        b += matrix[x + 1 + (y + 1) * 3] * unmodified_data[index * 4 + 2];
      }
    }
    data[i] = r / divideby;
    data[i + 1] = g / divideby;
    data[i + 2] = b / divideby;
  }
}

export function return_applied_matrix(
  data,
  image_width,
  image_height,
  matrix,
  divideby
) {
  const returned_data = [...data];
  for (let i = 0; i < data.length; i += 4) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        const index = getIndex(
          Math.floor(i / 4),
          x,
          y,
          image_width,
          image_height
        );
        r += matrix[x + 1 + (y + 1) * 3] * data[index * 4];
        g += matrix[x + 1 + (y + 1) * 3] * data[index * 4 + 1];
        b += matrix[x + 1 + (y + 1) * 3] * data[index * 4 + 2];
      }
    }
    returned_data[i] = r / divideby;
    returned_data[i + 1] = g / divideby;
    returned_data[i + 2] = b / divideby;
  }
  return returned_data;
}

export function boxblur(data, image_width, image_height) {
  apply_matrix(data, image_width, image_height, [1, 1, 1, 1, 1, 1, 1, 1, 1], 9);
}

export function sharpening(data, image_width, image_height) {
  const sharpened = return_applied_matrix(
    data,
    image_width,
    image_height,
    [0, 1, 0, 1, -4, 1, 0, 1, 0],
    1
  );
  subtract(data, sharpened);
}

function sum(first, second) {
  for (let i = 0; i < first.length && i < second.length; i += 4) {
    first[i] += second[i];
    if (first[i] > 255) first[i] = 255;

    first[i + 1] += second[i + 1];
    if (first[i + 1] > 255) first[i + 1] = 255;

    first[i + 2] += second[i + 2];
    if (first[i + 2] > 255) first[i + 2] = 255;
  }
}

function return_sum(first, second) {
  for (let i = 0; i < first.length && i < second.length; i += 4) {
    first[i] += second[i];
    if (first[i] > 255) first[i] = 255;

    first[i + 1] += second[i + 1];
    if (first[i + 1] > 255) first[i + 1] = 255;

    first[i + 2] += second[i + 2];
    if (first[i + 2] > 255) first[i + 2] = 255;
  }
  return first;
}

function subtract(first, second) {
  for (let i = 0; i < first.length && i < second.length; i += 4) {
    first[i] -= second[i];
    if (first[i] < 0) first[i] = 0;
    if (first[i] > 255) first[i] = 255;

    first[i + 1] -= second[i + 1];
    if (first[i + 1] < 0) first[i + 1] = 0;
    if (first[i + 1] > 255) first[i + 1] = 255;

    first[i + 2] -= second[i + 2];
    if (first[i + 2] < 0) first[i + 2] = 0;
    if (first[i + 2] > 255) first[i + 2] = 255;
  }
}

function return_subtraction(first, second) {
  for (let i = 0; i < first.length && i < second.length; i += 4) {
    first[i] -= second[i];
    if (first[i] < 0) first[i] = 0;

    first[i + 1] -= second[i + 1];
    if (first[i + 1] < 0) first[i + 1] = 0;

    first[i + 2] -= second[i + 2];
    if (first[i + 2] < 0) first[i + 2] = 0;
  }

  return first;
}

export function unsharpmasking(data, image_width, image_height) {
  const sharpened = return_applied_matrix(
    data,
    image_width,
    image_height,
    [1, 2, 1, 2, 4, 2, 1, 2, 1],
    16
  );
  let mask = return_subtraction([...data], sharpened);

  sum(data, mask);
}

export function laplacian(data, image_width, image_height) {
  apply_matrix(
    data,
    image_width,
    image_height,
    [0, 1, 0, 1, -4, 1, 0, 1, 0],
    1
  );
}

export function sobel(data, image_width, image_height) {
  const left = return_applied_matrix(
    data,
    image_width,
    image_height,
    [-1, 0, 1, -2, 0, 2, -1, 0, 1],
    1
  );
  const up = return_applied_matrix(
    data,
    image_width,
    image_height,
    [-1, -2, -1, 0, 0, 0, 1, 2, 1],
    1
  );
  const sum = return_sum(left, up);
  blit(data, sum);
}

function blit(target, source) {
  for (let i = 0; i < target.length; i += 4) {
    target[i] = source[i];
    target[i + 1] = source[i + 1];
    target[i + 2] = source[i + 2];
  }
}

export function multiply_channels(data, r, g, b) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] *= r;
    if (data[i] > 255) data[i] = 255;

    data[i + 1] *= g;
    if (data[i + 1] > 255) data[i + 1] = 255;

    data[i + 2] *= b;
    if (data[i + 2] > 255) data[i + 2] = 255;
  }
}

export function bucket_channels(data) {
  const buckets = { R: [], G: [], B: [] };

  for (let i = 0; i < 256; i++) {
    buckets.R[i] = 0;
    buckets.G[i] = 0;
    buckets.B[i] = 0;
  }

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    buckets.R[r]++;
    buckets.G[g]++;
    buckets.B[b]++;
  }

  const labeled = { R: [], G: [], B: [] };

  for (let i = 0; i < 256; i++) {
    const label = i;
    labeled.R.push({
      label: label,
      y: buckets.R[i],
      x: i,
    });
    labeled.G.push({
      label: label,
      y: buckets.G[i],
      x: i,
    });
    labeled.B.push({
      label: label,
      y: buckets.B[i],
      x: i,
    });
  }

  return labeled;
}

export function cut_from_to(source, dest, x1, x2, y1, y2, image_width) {
  if (source.length != dest.length) return;
  const fakesource = [...source];
  for (let x = x1; x < x2; x++) {
    for (let y = y1; y < y2; y++) {
      const index = x + y * image_width;
      dest[index * 4] = fakesource[index * 4];
      dest[index * 4 + 1] = fakesource[index * 4 + 1];
      dest[index * 4 + 2] = fakesource[index * 4 + 2];
      dest[index * 4 + 3] = 255;
      source[index * 4] = 0;
      source[index * 4 + 1] = 0;
      source[index * 4 + 2] = 0;
    }
  }
}

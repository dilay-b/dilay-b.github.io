
let flowers = [];
let selectedFlower = null;
let activeCategory = "All Flowers";

let categories = [
  "All Flowers",
  "Garden",
  "Wildflower",
  "Herb",
  "Indoor"
];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");

  try {
    const response = await fetch("blumen.csv");
    const csvText = await response.text();

    loadFlowers(csvText);
    positionFlowers();
  } catch (error) {
    console.error("CSV could not be loaded:", error);
  }
}

function loadFlowers(csvText) {
  let rows = csvText.trim().split(/\r?\n/);

  let headerIndex = rows.findIndex(row =>
    row.toLowerCase().includes("flowers") &&
    row.toLowerCase().includes("category")
  );

  if (headerIndex === -1) {
    console.error("CSV header not found.");
    return;
  }

  let headers = rows[headerIndex].split(",").map(h => h.trim());

  flowers = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    let values = rows[i].split(",").map(v => v.trim());

    if (values.length < headers.length) continue;

    let data = {};

    headers.forEach((header, index) => {
      data[header.toLowerCase()] = values[index];
    });

    flowers.push({
      name: data.flowers || "Unknown",
      category: data.category || "Other",
      height: Number(data.height_cm) || 0,
      petals: Number(data.petals) || 0,
      size: Number(data.size) || 0,
      season: data.season || "Unknown",
      saturation: Number(data.saturation) || 0,
      color: data.color || "#FFFFFF",
      x: 0,
      y: 0,
      scale: random(0.8, 1.2),
      phase: random(TWO_PI)
    });
  }
}

function getVisibleFlowers() {
  if (activeCategory === "All Flowers") {
    return flowers;
  }

  return flowers.filter(f =>
    f.category.toLowerCase() === activeCategory.toLowerCase()
  );
}

// Calculate centered button positions, with wrapping for smaller screens.
function getCategoryLayout() {
  textFont("Courier New");
  textSize(13);

  let buttonHeight = 40;
  let gap = 12;
  let padding = 24;
  let maxWidth = width - 40;

  let rows = [];
  let currentRow = [];
  let currentWidth = 0;

  for (let category of categories) {
    let buttonWidth = textWidth(category) + padding * 2;

    if (
      currentRow.length > 0 &&
      currentWidth + buttonWidth + gap > maxWidth
    ) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }

    currentRow.push({
      category,
      width: buttonWidth
    });

    currentWidth += buttonWidth + (currentRow.length > 1 ? gap : 0);
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  let layout = [];
  let startY = 137;

  rows.forEach((row, rowIndex) => {
    let rowWidth = row.reduce((sum, item) => sum + item.width, 0)
      + gap * (row.length - 1);

    let x = (width - rowWidth) / 2;
    let y = startY + rowIndex * (buttonHeight + 10);

    row.forEach(item => {
      layout.push({
        category: item.category,
        x,
        y,
        width: item.width,
        height: buttonHeight
      });

      x += item.width + gap;
    });
  });

  return layout;
}

function getFlowerAreaTop() {
  let layout = getCategoryLayout();

  let bottom = 137;

  for (let button of layout) {
    bottom = max(bottom, button.y + button.height);
  }

  return bottom + 38;
}

function positionFlowers() {
  let visible = getVisibleFlowers();

  let topArea = getFlowerAreaTop();
  let bottomArea = height - 175;

  visible.forEach(flower => {
    flower.x = random(70, max(71, width - 70));
    flower.y = random(topArea, max(topArea + 20, bottomArea));
  });
}

function draw() {
  background("#080D19");

  drawHeader();
  drawCategories();
  drawFlowers();
  drawInformationPanel();
}

function drawHeader() {
  textAlign(CENTER, CENTER);
  noStroke();

  // Main title
  fill("#F2F0E9");
  textFont("Georgia");
  textStyle(NORMAL);
  textSize(min(54, width * 0.12));
  text("BLOOM", width / 2, 48);

  // Subtitle
  fill("#B5AD9D");
  textSize(15);
  text("BOTANICAL UNIVERSE", width / 2, 91);

  // Decorative divider
  stroke("#414A5B");
  strokeWeight(1);
  line(42, 116, width - 42, 116);
}

function drawCategories() {
  let layout = getCategoryLayout();

  textFont("Courier New");
  textSize(13);
  textAlign(CENTER, CENTER);

  for (let button of layout) {
    if (activeCategory === button.category) {
      fill("#E8E5DB");
      noStroke();
    } else {
      noFill();
      stroke("#596174");
      strokeWeight(1);
    }

    rect(
      button.x,
      button.y,
      button.width,
      button.height,
      22
    );

    noStroke();

    if (activeCategory === button.category) {
      fill("#101725");
    } else {
      fill("#C2C5CC");
    }

    text(
      button.category,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }
}

function drawFlowers() {
  let visible = getVisibleFlowers();

  for (let flower of visible) {
    drawFlower(flower);
  }
}

function drawFlower(flower) {
  push();

  translate(flower.x, flower.y);

  let pulse = sin(frameCount * 0.025 + flower.phase) * 2;
  let flowerSize = 17 + flower.size * 1.2 + pulse;

  let flowerColor = color(flower.color);

  // --------------------------------
  // SOFT COLORED GLOW - LARGER
  // --------------------------------

  let glowPulse = sin(frameCount * 0.035 + flower.phase);
  let glowSize = flowerSize * (3.6 + glowPulse * 0.5);
  let glowAlpha = 27 + glowPulse * 10;

  noStroke();

  for (let i = 12; i >= 1; i--) {
    let layerSize = glowSize * (i / 4);
    let alpha = glowAlpha * (1 - i / 14);

    fill(
      red(flowerColor),
      green(flowerColor),
      blue(flowerColor),
      alpha
    );

    ellipse(0, 0, layerSize);
  }

  // Outer atmospheric halo
  fill(
    red(flowerColor),
    green(flowerColor),
    blue(flowerColor),
    9 + glowPulse * 4
  );

  ellipse(0, 0, glowSize * 1.5);

  // --------------------------------
  // STEM
  // --------------------------------

  stroke("#587C69");
  strokeWeight(2);
  line(0, flowerSize * 0.4, 0, flowerSize * 2.8);

  // --------------------------------
  // LEAVES
  // --------------------------------

  noStroke();
  fill("#587C69");
  ellipse(-7, flowerSize * 1.7, 13, 5);
  ellipse(7, flowerSize * 2.2, 13, 5);

  // --------------------------------
  // PETALS
  // --------------------------------

  let petalCount = max(5, flower.petals || 6);

  for (let i = 0; i < petalCount; i++) {
    let angle = TWO_PI / petalCount * i;

    push();
    rotate(angle);

    fill(
      red(flowerColor),
      green(flowerColor),
      blue(flowerColor),
      235
    );

    ellipse(
      0,
      -flowerSize * 0.55,
      flowerSize * 0.42,
      flowerSize
    );

    pop();
  }

  // --------------------------------
  // FLOWER CENTER
  // --------------------------------

  fill("#F4D77A");
  ellipse(0, 0, flowerSize * 0.55);

  // --------------------------------
  // FLOWER NAME ABOVE THE FLOWER
  // --------------------------------

  noStroke();
  textFont("Georgia");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(13);

  fill(
    red(flowerColor),
    green(flowerColor),
    blue(flowerColor),
    220
  );

  text(
    flower.name,
    0,
    -flowerSize * 1.65
  );

  // --------------------------------
  // HOVER EFFECT
  // --------------------------------

  let d = dist(mouseX, mouseY, flower.x, flower.y);

  if (d < flowerSize * 1.2) {
    noFill();
    stroke(
      red(flowerColor),
      green(flowerColor),
      blue(flowerColor),
      180
    );
    strokeWeight(2);

    ellipse(
      0,
      0,
      flowerSize * 2.5
    );
  }

  pop();
}

function drawInformationPanel() {
  let panelY = height - 150;

  noStroke();
  fill("#111827");
  rect(0, panelY, width, 150);

  stroke("#303A4B");
  strokeWeight(1);
  line(42, panelY, width - 42, panelY);

  if (!selectedFlower) {
    drawEmptyPanel(panelY);
    return;
  }

  let f = selectedFlower;

  // Flower name
  textAlign(LEFT, TOP);
  textFont("Georgia");
  textStyle(NORMAL);
  textSize(min(34, width * 0.075));
  fill("#F2F0E9");
  text(f.name, 42, panelY + 35);

  // Category label
  textFont("Courier New");
  textSize(10);
  fill("#929BAA");
  text(
    "SELECTED SPECIMEN / " + f.category.toUpperCase(),
    44,
    panelY + 85
  );

  // Botanical data
  let info = [
    ["HEIGHT", f.height + " CM"],
    ["PETALS", f.petals],
    ["SIZE", f.size],
    ["SEASON", f.season.toUpperCase()],
    ["SATURATION", f.saturation + "%"]
  ];

  let startX = min(width * 0.48, 520);
  let availableWidth = max(0, width - startX - 42);
  let columnWidth = availableWidth / info.length;

  for (let i = 0; i < info.length; i++) {
    let x = startX + i * columnWidth;

    fill("#7F8999");
    textFont("Courier New");
    textStyle(NORMAL);
    textSize(9);
    text(info[i][0], x, panelY + 48);

    fill("#F2F0E9");
    textSize(13);
    textStyle(BOLD);
    text(info[i][1], x, panelY + 70);
  }
}

function drawEmptyPanel(panelY) {
  textAlign(LEFT, TOP);

  textFont("Georgia");
  textStyle(NORMAL);
  textSize(27);
  fill("#F2F0E9");
  text("Discover a flower", 42, panelY + 35);

  textFont("Courier New");
  textSize(10);
  fill("#929BAA");
  text(
    "SELECT A SPECIMEN TO EXPLORE ITS DETAILS",
    44,
    panelY + 78
  );
}

function mousePressed() {
  // Category buttons
  let layout = getCategoryLayout();

  for (let button of layout) {
    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height
    ) {
      activeCategory = button.category;
      selectedFlower = null;
      positionFlowers();
      return;
    }
  }

  // Flower selection
  let visible = getVisibleFlowers();

  for (let flower of visible) {
    let d = dist(mouseX, mouseY, flower.x, flower.y);

    if (d < 35 + flower.size) {
      selectedFlower = flower;
      return;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionFlowers();
}

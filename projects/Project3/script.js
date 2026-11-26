// ============================================================
// BLUMENGARTEN
// Lädt Blumen aus einer CSV-Datei und zeigt sie als Pflanzen.
// Die Blumen werden von der längsten zur kleinsten sortiert.
// ============================================================

let flowers = [];          // Alle geladenen Blumen
let selector;              // Filter-Menü
let selectedFlower = null; // Aktuell ausgewählte Blume
let dataLoaded = false;    // Wurden die Daten geladen?

const CSV_FILE = "blumen.csv";
const COLUMNS = 6;         // Blumen pro Reihe


// ============================================================
// SETUP
// ============================================================

async function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");

  await loadFlowers();
  createFilterMenu();
}

// ============================================================
// CSV-DATEN LADEN
// ============================================================

async function loadFlowers() {
  try {
    const response = await fetch(CSV_FILE);

    if (!response.ok) {
      throw new Error(CSV_FILE + " konnte nicht gefunden werden.");
    }

    const csvText = await response.text();
    flowers = readCSV(csvText);

    dataLoaded = true;

  } catch (error) {
    console.error(error);
  }
}
//============================================================
// Liest den CSV-Text und erstellt eine Liste mit Blumen
//============================================================
function readCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);

  const headers = lines[0]
    .split(",")
    .map(header => header.trim());

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(value => value.trim());

    const flower = {
      name: values[headers.indexOf("Flowers")],
      category: values[headers.indexOf("Category")],
      height: Number(values[headers.indexOf("Height_cm")]),
      petals: Number(values[headers.indexOf("Petals")]),
      size: Number(values[headers.indexOf("Size")]),
      season: values[headers.indexOf("Season")],
      saturation: Number(values[headers.indexOf("Saturation")]),
      color: values[headers.indexOf("Color")]
    };

    result.push(flower);
  }

  return result;
}


// ============================================================
// FILTER-MENÜ
// ============================================================

function createFilterMenu() {
  selector = createSelect();
  selector.position(20, 20);

  selector.option("All flowers", "all");
  selector.option("Garden", "Garden");
  selector.option("Wildflower", "Wildflower");
  selector.option("Herb", "Herb");
  selector.option("Indoor", "Indoor");
}
//============================================================
// Gibt nur die Blumen zurück, die zum gewählten Filter passen.
// Die Blumen werden von der längsten zur kleinsten sortiert.
//============================================================
function getVisibleFlowers() {
  const filter = selector.value();

  const visibleFlowers = flowers.filter(flower => {
    return filter === "all" || flower.category === filter;
  });

  // Höchste Blume zuerst
  visibleFlowers.sort(function(a, b) {
    return b.height - a.height;
  });

  return visibleFlowers;
}


// ============================================================
// ZEICHNEN
// ============================================================

function draw() {
  background(245, 240, 225);

  if (!dataLoaded) {
    drawLoadingText();
    return;
  }

  const visibleFlowers = getVisibleFlowers();

  for (let i = 0; i < visibleFlowers.length; i++) {
    const flower = visibleFlowers[i];
    const position = getFlowerPosition(i);

    drawPlant(flower, position.x, position.y);
  }

  if (selectedFlower) {
    drawInfo(selectedFlower);
  }
}

function drawLoadingText() {
  fill(50);
  textSize(20);
  textAlign(LEFT);
  text("Loading garden...", 30, 80);
}

//============================================================
// Berechnet die Position einer Blume im Raster.
// Die erste Blume ist oben links, danach geht es nach rechts.============================================================
//============================================================
function getFlowerPosition(index) {
  const spacingX = width / (COLUMNS + 1);
  const spacingY = height / 4;

  const column = index % COLUMNS;
  const row = floor(index / COLUMNS);

  return {
    x: spacingX * (column + 1),
    y: spacingY * (row + 1) + 100
  };
}
//============================================================
// Zeichnet eine komplette Pflanze
// ============================================================
function drawPlant(flower, x, y) {
  const stemHeight = map(flower.height || 30, 0, 150, 50, 180);
  const flowerSize = map(flower.size || 20, 0, 100, 15, 55);
  const topY = y - stemHeight;

  drawStem(x, y, topY);
  drawLeaves(x, y, stemHeight);

  if (flower.petals > 0) {
    drawFlower(x, topY, flowerSize, flower);
  } else {
    drawLeafPlant(x, topY, flowerSize, flower);
  }

  drawFlowerName(flower.name, x, y);
}

function drawStem(x, y, topY) {
  stroke(65, 120, 75);
  strokeWeight(4);
  line(x, y, x, topY);
}

function drawLeaves(x, y, stemHeight) {
  noStroke();
  fill(90, 145, 90);

  ellipse(x - 12, y - stemHeight * 0.4, 25, 10);
  ellipse(x + 12, y - stemHeight * 0.65, 25, 10);
}

function drawFlowerName(name, x, y) {
  noStroke();
  fill(50);
  textAlign(CENTER);
  textSize(12);
  text(name, x, y + 20);
}


// ============================================================
// BLÜTE ZEICHNEN
// ============================================================

function drawFlower(x, y, size, flower) {
  const petalColor = getPetalColor(flower);
  const petals = constrain(flower.petals, 1, 30);

  noStroke();
  fill(petalColor);

  for (let i = 0; i < petals; i++) {
    const angle = TWO_PI / petals * i;

    const petalX = x + cos(angle) * size * 0.45;
    const petalY = y + sin(angle) * size * 0.45;

    ellipse(petalX, petalY, size * 0.65, size * 0.4);
  }

  fill(245, 190, 70);
  ellipse(x, y, size * 0.4);
}
//============================================================
// Berechnet die Blütenfarbe anhand der Sättigung
//============================================================

function getPetalColor(flower) {
  const baseColor = color(flower.color || "#E88B9C");
  const saturation = constrain(flower.saturation || 100, 0, 100);

  return lerpColor(
    color(235, 225, 215),
    baseColor,
    saturation / 100
  );
}


// ============================================================
// PFLANZE OHNE BLÜTE ZEICHNEN
// ============================================================

function drawLeafPlant(x, y, size, flower) {
  noStroke();
  fill(flower.color || "#75A879");

  for (let i = 0; i < 8; i++) {
    const angle = TWO_PI / 8 * i;

    const leafX = x + cos(angle) * size * 0.3;
    const leafY = y + sin(angle) * size * 0.3;

    push();
    translate(leafX, leafY);
    rotate(angle);
    ellipse(0, 0, size * 0.8, size * 0.35);
    pop();
  }

  fill(70, 120, 75);
  ellipse(x, y, size * 0.25);
}


// ============================================================
// INFO-FENSTER
// ============================================================

function drawInfo(flower) {
  drawInfoBox();
  drawInfoText(flower);
}

function drawInfoBox() {
  noStroke();
  fill(255, 250);
  rect(width - 230, 20, 210, 150, 12);
}

function drawInfoText(flower) {
  fill(40);
  textAlign(LEFT);

  textSize(16);
  text(flower.name, width - 215, 48);

  textSize(12);
  text("Category: " + flower.category, width - 215, 75);
  text("Height: " + flower.height + " cm", width - 215, 98);
  text("Petals: " + flower.petals, width - 215, 121);
  text("Season: " + flower.season, width - 215, 144);
}


// ============================================================
// MAUS-KLICK
// ============================================================

function mousePressed() {
  if (!dataLoaded) return;

  const visibleFlowers = getVisibleFlowers();

  for (let i = 0; i < visibleFlowers.length; i++) {
    const flower = visibleFlowers[i];
    const position = getFlowerPosition(i);

    const stemHeight = map(flower.height || 30, 0, 150, 50, 180);
    const topY = position.y - stemHeight;

    const distance = dist(mouseX, mouseY, position.x, topY);

    if (distance < 45) {
      selectedFlower = flower;
      return;
    }
  }
}

// ============================================================
// FENSTERGRÖSSE
// ============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
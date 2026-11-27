
let letters = [];
let trailGraphics;

let influenceSize = 90;

let message = [
  "RUN BEFORE THE WORLD CATCHES UP.",
  "ESCAPE THE THINGS THAT HOLD YOU BACK.",
  "KEEP MOVING. KEEP DREAMING. KEEP GOING.",
  "NO MATTER HOW FAR YOU RUN. THERE IS ALWAYS SOMETHING WAITING AHEAD."
];

let fontSize = 58;
let lineHeight = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);

  trailGraphics = createGraphics(width, height);
  trailGraphics.colorMode(HSB, 360, 100, 100, 10);

  colorMode(HSB, 360, 100, 100, 100);
  textFont("Helvetica");
  textStyle(BOLD);
  textSize(fontSize);
  textAlign(CENTER, CENTER);

  let y = 100;

  while (y < height + lineHeight) {
    for (let line of message) {
      let x = 0;

      while (x < width) {
        for (let i = 0; i < line.length; i++) {
          let w = textWidth(line[i]);

          letters.push({
            char: line[i],
            x: x + w / 2,
            y: y,
            originalX: x + w / 2,
            originalY: y,
            vx: 0,
            vy: 0
          });

          x += w;
        }

        x += fontSize * 2;
      }

      y += lineHeight;

      if (y >= height + lineHeight) break;
    }
  }
}

function draw() {

  // Tiefschwarzer Hintergrund
  background(0);

  // Farbspuren langsam und vollständig verblassen
  let ctx = trailGraphics.drawingContext;

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.008)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Dynamischer Farbwechsel
  let hue = (frameCount * 0.8) % 360;

  // Maus-Einfluss
  if (mouseIsPressed) {
    influenceSize = lerp(influenceSize, 180, 0.08);
  } else {
    influenceSize = lerp(influenceSize, 90, 0.08);
  }

  // Weicher, farbiger Neon-Verlauf ohne weissen Kern
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  let gradient = ctx.createRadialGradient(
    mouseX, mouseY, 0,
    mouseX, mouseY, influenceSize * 2
  );

  gradient.addColorStop(
    0,
    `hsla(${hue}, 100%, 50%, 0.18)`
  );

  gradient.addColorStop(
    0.3,
    `hsla(${(hue + 12) % 360}, 100%, 20%, 0.14)`
  );

  gradient.addColorStop(
    0.65,
    `hsla(${(hue + 28) % 360}, 100%, 20%, 0.07)`
  );

  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, influenceSize * 2, 0, TWO_PI);
  ctx.fill();

  ctx.restore();

  // Farbspuren anzeigen
  image(trailGraphics, 0, 0);

  // Buchstabenanimation
  for (let l of letters) {

    let d = dist(mouseX, mouseY, l.x, l.y);

    if (d < influenceSize * 2 && d > 0) {

      let angle = atan2(l.y - mouseY, l.x - mouseX);
      let force = map(d, 0, influenceSize * 2, 25, 10);

      l.vx += cos(angle) * force;
      l.vy += sin(angle) * force;

      // Zufällige Bewegung
      l.vx += random(-2, 2);
      l.vy += random(-2, 2);
    }

    l.x += l.vx;
    l.y += l.vy;

    // Reibung
    l.vx *= 0.88;
    l.vy *= 0.88;

    // Zur ursprünglichen Position zurückkehren
    l.x = lerp(l.x, l.originalX, 0.12);
    l.y = lerp(l.y, l.originalY, 0.12);

    // Schrift
    fill(0, 0, 0);
    textSize(fontSize);
    text(l.char, l.x, l.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  trailGraphics = createGraphics(width, height);
  trailGraphics.colorMode(HSB, 360, 100, 100, 100);
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

let W = 0;
let H = 0;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();


// ==============================
// SPIELER
// ==============================

const player = {
    x: 420,
    y: 430,
    width: 32,
    height: 44,
    speed: 3,
    direction: "down"
};


// ==============================
// SPIELZUSTAND
// ==============================

const game = {

    minutes: 360,

    tasks: {
        talkedToMother: false,
        packedBag: false,
        ateBreakfast: false
    },

    dialogOpen: false,

    currentDialog: null,
    dialogIndex: 0,

    nearbyObject: null
};


// ==============================
// TASTATUR
// ==============================

const keys = {};

window.addEventListener("keydown", event => {

    keys[event.key.toLowerCase()] = true;

    if (
        event.key === " " ||
        event.key === "Enter" ||
        event.key.toLowerCase() === "e"
    ) {
        interact();
    }
});

window.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});


// ==============================
// MOBILE
// ==============================

function mobileButton(id, key) {

    const button = document.getElementById(id);

    button.addEventListener("pointerdown", e => {
        e.preventDefault();
        keys[key] = true;
    });

    button.addEventListener("pointerup", e => {
        e.preventDefault();
        keys[key] = false;
    });

    button.addEventListener("pointerleave", () => {
        keys[key] = false;
    });
}

mobileButton("up", "arrowup");
mobileButton("down", "arrowdown");
mobileButton("left", "arrowleft");
mobileButton("right", "arrowright");


// ==============================
// OBJEKTE
// ==============================

const objects = [

    {
        id: "mother",
        x: 760,
        y: 180,
        width: 35,
        height: 45,
        type: "npc",
        name: "Mutter"
    },

    {
        id: "bed",
        x: 180,
        y: 130,
        width: 140,
        height: 75,
        type: "object",
        name: "Bett"
    },

    {
        id: "desk",
        x: 400,
        y: 130,
        width: 130,
        height: 60,
        type: "object",
        name: "Schreibtisch"
    },

    {
        id: "backpack",
        x: 450,
        y: 210,
        width: 35,
        height: 35,
        type: "object",
        name: "Rucksack"
    },

    {
        id: "table",
        x: 750,
        y: 390,
        width: 150,
        height: 90,
        type: "object",
        name: "Frühstückstisch"
    },

    {
        id: "door",
        x: 1050,
        y: 480,
        width: 55,
        height: 100,
        type: "exit",
        name: "Haustür"
    }
];


// ==============================
// KAMERA
// ==============================

let camera = {
    x: 0,
    y: 0
};


// ==============================
// BEWEGUNG
// ==============================

function updatePlayer() {

    if (game.dialogOpen) return;

    let dx = 0;
    let dy = 0;

    if (keys["arrowup"] || keys["w"]) {
        dy -= 1;
        player.direction = "up";
    }

    if (keys["arrowdown"] || keys["s"]) {
        dy += 1;
        player.direction = "down";
    }

    if (keys["arrowleft"] || keys["a"]) {
        dx -= 1;
        player.direction = "left";
    }

    if (keys["arrowright"] || keys["d"]) {
        dx += 1;
        player.direction = "right";
    }

    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(dx * dx + dy * dy);

        dx /= length;
        dy /= length;

        const newX = player.x + dx * player.speed;
        const newY = player.y + dy * player.speed;

        if (!collision(newX, newY)) {

            player.x = newX;
            player.y = newY;

            game.minutes += 0.02;
        }
    }
}


// ==============================
// KOLLISION
// ==============================

function collision(x, y) {

    const margin = 12;

    // Weltgrenzen

    if (x < 40) return true;
    if (y < 40) return true;
    if (x > 1120) return true;
    if (y > 610) return true;

    // Objekte

    for (const obj of objects) {

        if (obj.type === "npc") continue;

        if (
            x + player.width - margin > obj.x &&
            x + margin < obj.x + obj.width &&
            y + player.height - margin > obj.y &&
            y + margin < obj.y + obj.height
        ) {
            return true;
        }
    }

    return false;
}


// ==============================
// NÄCHSTES OBJEKT
// ==============================

function checkNearby() {

    let closest = null;
    let closestDistance = Infinity;

    for (const obj of objects) {

        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height / 2;

        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        const distance = Math.hypot(
            px - centerX,
            py - centerY
        );

        if (distance < 85 && distance < closestDistance) {

            closest = obj;
            closestDistance = distance;
        }
    }

    game.nearbyObject = closest;

    const box = document.getElementById("interaction");

    if (closest) {

        box.style.display = "block";

        document.getElementById("interactionText").textContent =
            closest.type === "npc"
                ? "Mit " + closest.name + " sprechen"
                : closest.name + " untersuchen";

    } else {

        box.style.display = "none";
    }
}


// ==============================
// INTERAKTION
// ==============================

function interact() {

    if (game.dialogOpen) return;

    const obj = game.nearbyObject;

    if (!obj) return;

    if (obj.id === "mother") {

        motherDialog();

    } else if (obj.id === "backpack") {

        packBag();

    } else if (obj.id === "table") {

        breakfast();

    } else if (obj.id === "bed") {

        showDialog(
            "Leo",
            [
                "Mein Bett.",
                "Ich würde wirklich gerne wieder schlafen.",
                "Aber Mama würde mich wahrscheinlich sofort wieder wecken."
            ]
        );

    } else if (obj.id === "desk") {

        showDialog(
            "Leo",
            [
                "Mein Schreibtisch.",
                "Hier liegen meine Bücher für die Schule.",
                "Heute wartet auch noch eine Mathearbeit auf mich."
            ]
        );

    } else if (obj.id === "door") {

        leaveHouse();
    }
}


// ==============================
// MUTTER
// ==============================

function motherDialog() {

    game.tasks.talkedToMother = true;

    showDialog(
        "Mutter",
        [
            "Leo! Endlich bist du aufgestanden.",
            "Der Bus kommt bald.",
            "Hast du deinen Rucksack schon gepackt?",
            "Und frühstücke bitte noch etwas.",
            "Heute ist doch deine Mathearbeit.",
            "Du schaffst das. Jetzt aber los!"
        ]
    );
}


// ==============================
// RUCKSACK
// ==============================

function packBag() {

    if (game.tasks.packedBag) {

        showDialog(
            "Leo",
            [
                "Der Rucksack ist schon gepackt."
            ]
        );

        return;
    }

    game.tasks.packedBag = true;

    showDialog(
        "Leo",
        [
            "Ich sollte meinen Rucksack packen.",
            "Mathebuch...",
            "Geschichtsbuch...",
            "Hefte...",
            "Geometriedreieck...",
            "Fertig!"
        ]
    );
}


// ==============================
// FRÜHSTÜCK
// ==============================

function breakfast() {

    if (game.tasks.ateBreakfast) {

        showDialog(
            "Leo",
            [
                "Ich habe schon gefrühstückt."
            ]
        );

        return;
    }

    game.tasks.ateBreakfast = true;

    showDialog(
        "Leo",
        [
            "Das Frühstück steht schon bereit.",
            "Ich habe eigentlich keinen großen Hunger...",
            "Na gut.",
            "Ein paar Bissen können nicht schaden."
        ]
    );
}


// ==============================
// HAUSTÜR
// ==============================

function leaveHouse() {

    if (!game.tasks.talkedToMother) {

        showDialog(
            "Leo",
            [
                "Ich sollte zuerst mit Mama sprechen."
            ]
        );

        return;
    }

    if (!game.tasks.packedBag) {

        showDialog(
            "Leo",
            [
                "Moment...",
                "Mein Rucksack!",
                "Den kann ich nicht in der Schule vergessen."
            ]
        );

        return;
    }

    showDialog(
        "Leo",
        [
            "Alles klar.",
            "Rucksack dabei.",
            "Mit Mama gesprochen.",
            "Jetzt muss ich zur Bushaltestelle."
        ]
    );
}


// ==============================
// DIALOG
// ==============================

function showDialog(name, texts) {

    game.dialogOpen = true;

    game.currentDialog = {
        name,
        texts
    };

    game.dialogIndex = 0;

    document.getElementById("dialog").style.display = "block";

    updateDialog();
}

function updateDialog() {

    const dialog = game.currentDialog;

    document.getElementById("dialogName").textContent =
        dialog.name;

    document.getElementById("dialogText").textContent =
        dialog.texts[game.dialogIndex];

    document.getElementById("dialogNext").textContent =
        game.dialogIndex <
        dialog.texts.length - 1
            ? "Weiter"
            : "Schließen";
}

document.getElementById("dialogNext").addEventListener("click", () => {

    if (!game.currentDialog) return;

    if (
        game.dialogIndex <
        game.currentDialog.texts.length - 1
    ) {

        game.dialogIndex++;

        updateDialog();

    } else {

        closeDialog();
    }
});

document.getElementById("interactionButton").addEventListener("click", interact);

function closeDialog() {

    document.getElementById("dialog").style.display = "none";

    game.dialogOpen = false;
    game.currentDialog = null;

    updateTasks();
}


// ==============================
// AUFGABEN
// ==============================

function updateTasks() {

    let count = 0;

    if (game.tasks.talkedToMother) count++;
    if (game.tasks.packedBag) count++;
    if (game.tasks.ateBreakfast) count++;

    document.getElementById("tasks").textContent =
        count + "/3";
}


// ==============================
// ZEIT
// ==============================

function updateClock() {

    const totalMinutes = Math.floor(game.minutes);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    document.getElementById("clock").textContent =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0");
}


// ==============================
// ZEICHNEN
// ==============================

function draw() {

    ctx.clearRect(0, 0, W, H);

    camera.x =
        player.x - W / 2;

    camera.y =
        player.y - H / 2;

    camera.x =
        Math.max(0, Math.min(1200 - W, camera.x));

    camera.y =
        Math.max(0, Math.min(700 - H, camera.y));

    drawWorld();

    drawObjects();

    drawPlayer();
}


// ==============================
// WELT
// ==============================

function drawWorld() {

    ctx.fillStyle = "#5d704e";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    // Hausboden

    ctx.fillStyle = "#b99a6d";

    ctx.fillRect(
        80 - camera.x,
        70 - camera.y,
        1000,
        550
    );

    // Wände

    ctx.fillStyle = "#754c35";

    ctx.fillRect(
        80 - camera.x,
        70 - camera.y,
        1000,
        18
    );

    ctx.fillRect(
        80 - camera.x,
        70 - camera.y,
        18,
        550
    );

    ctx.fillRect(
        1062 - camera.x,
        70 - camera.y,
        18,
        550
    );

    // Räume

    ctx.strokeStyle = "#745137";
    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(600 - camera.x, 70 - camera.y);
    ctx.lineTo(600 - camera.x, 350 - camera.y);

    ctx.moveTo(80 - camera.x, 350 - camera.y);
    ctx.lineTo(1080 - camera.x, 350 - camera.y);

    ctx.stroke();

    // Fenster

    drawWindow(130, 90);
    drawWindow(850, 90);

    // Teppich

    ctx.fillStyle = "#8d5e56";

    ctx.fillRect(
        450 - camera.x,
        410 - camera.y,
        260,
        130
    );
}


// ==============================
// FENSTER
// ==============================

function drawWindow(x, y) {

    ctx.fillStyle = "#496f91";

    ctx.fillRect(
        x - camera.x,
        y - camera.y,
        120,
        70
    );

    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 6;

    ctx.strokeRect(
        x - camera.x,
        y - camera.y,
        120,
        70
    );

    ctx.beginPath();

    ctx.moveTo(
        x + 60 - camera.x,
        y - camera.y
    );

    ctx.lineTo(
        x + 60 - camera.x,
        y + 70 - camera.y
    );

    ctx.stroke();
}


// ==============================
// OBJEKTE ZEICHNEN
// ==============================

function drawObjects() {

    // Bett

    ctx.fillStyle = "#405f91";

    ctx.fillRect(
        180 - camera.x,
        130 - camera.y,
        140,
        75
    );

    ctx.fillStyle = "#eee";

    ctx.fillRect(
        190 - camera.x,
        140 - camera.y,
        55,
        35
    );

    // Schreibtisch

    ctx.fillStyle = "#68452e";

    ctx.fillRect(
        400 - camera.x,
        130 - camera.y,
        130,
        60
    );

    // Rucksack

    ctx.fillStyle = "#293b58";

    ctx.fillRect(
        450 - camera.x,
        210 - camera.y,
        35,
        35
    );

    // Küche

    ctx.fillStyle = "#555";

    ctx.fillRect(
        650 - camera.x,
        100 - camera.y,
        350,
        60
    );

    // Tisch

    ctx.fillStyle = "#70472d";

    ctx.beginPath();

    ctx.ellipse(
        825 - camera.x,
        435 - camera.y,
        75,
        45,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Tür

    ctx.fillStyle = "#54321f";

    ctx.fillRect(
        1050 - camera.x,
        480 - camera.y,
        55,
        100
    );

    // Mutter

    drawMother();
}


// ==============================
// MUTTER ZEICHNEN
// ==============================

function drawMother() {

    const x = 760 - camera.x;
    const y = 180 - camera.y;

    // Beine

    ctx.fillStyle = "#3d3d55";

    ctx.fillRect(
        x + 7,
        y + 30,
        8,
        18
    );

    ctx.fillRect(
        x + 21,
        y + 30,
        8,
        18
    );

    // Körper

    ctx.fillStyle = "#8a5672";

    ctx.fillRect(
        x + 3,
        y + 20,
        30,
        28
    );

    // Hals

    ctx.fillStyle = "#dca27b";

    ctx.fillRect(
        x + 12,
        y + 15,
        10,
        10
    );

    // Kopf

    ctx.fillStyle = "#e3ad86";

    ctx.beginPath();

    ctx.arc(
        x + 17,
        y + 10,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Haare

    ctx.fillStyle = "#4b2c22";

    ctx.beginPath();

    ctx.arc(
        x + 17,
        y + 5,
        16,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    // Augen

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 10,
        y + 9,
        3,
        3
    );

    ctx.fillRect(
        x + 21,
        y + 9,
        3,
        3
    );
}


// ==============================
// LEO ZEICHNEN
// ==============================

function drawPlayer() {

    const x = player.x - camera.x;
    const y = player.y - camera.y;

    // Schatten

    ctx.fillStyle = "rgba(0,0,0,.25)";

    ctx.beginPath();

    ctx.ellipse(
        x + 16,
        y + 43,
        16,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Beine

    ctx.fillStyle = "#27364d";

    ctx.fillRect(
        x + 7,
        y + 30,
        8,
        15
    );

    ctx.fillRect(
        x + 20,
        y + 30,
        8,
        15
    );

    // Schuhe

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 4,
        y + 42,
        12,
        5
    );

    ctx.fillRect(
        x + 20,
        y + 42,
        12,
        5
    );

    // Körper

    ctx.fillStyle = "#496f9c";

    ctx.fillRect(
        x + 4,
        y + 18,
        28,
        20
    );

    // Kopf

    ctx.fillStyle = "#e0aa82";

    ctx.beginPath();

    ctx.arc(
        x + 18,
        y + 10,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Haare

    ctx.fillStyle = "#3c2923";

    ctx.beginPath();

    ctx.arc(
        x + 18,
        y + 6,
        14,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();

    // Augen

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x + 11,
        y + 10,
        3,
        3
    );

    ctx.fillRect(
        x + 22,
        y + 10,
        3,
        3
    );
}


// ==============================
// SPIELSCHLEIFE
// ==============================

function gameLoop() {

    updatePlayer();

    checkNearby();

    updateClock();

    updateTasks();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();

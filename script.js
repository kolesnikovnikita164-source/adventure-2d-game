"use strict";

/*
    LEO-LUKAS
    Kleines 2D-Pixel-Adventure
    Keine externen Assets nötig.
*/

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const TILE = 32;

const keys = {};
const pressed = {};

window.addEventListener("keydown", e => {
    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    ) {
        e.preventDefault();
    }

    if (!keys[e.key.toLowerCase()]) {
        pressed[e.key.toLowerCase()] = true;
    }

    keys[e.key.toLowerCase()] = true;

    if (e.key === "Escape") {
        togglePause();
    }

    if (e.key.toLowerCase() === "e" || e.key === "Enter") {
        interact();
    }
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

const game = {
    room: "bedroom",

    player: {
        x: 7 * TILE,
        y: 9 * TILE,
        w: 20,
        h: 25,
        speed: 2.4,
        direction: "down",
        frame: 0,
        moving: false
    },

    camera: {
        x: 0,
        y: 0
    },

    inventory: {
        backpack: false,
        breakfast: false,
        key: false
    },

    state: {
        alarmOff: false,
        talkedToMother: false,
        breakfastDone: false,
        outside: false,
        crowSeen: false,
        busArrived: false,
        boardedBus: false
    },

    dialogue: null,
    dialogueIndex: 0,
    paused: false
};

const rooms = {
    bedroom: {
        width: 28,
        height: 16,
        playerStart: { x: 7 * TILE, y: 10 * TILE },

        objects: [
            {
                id: "bed",
                x: 3 * TILE,
                y: 3 * TILE,
                w: 4 * TILE,
                h: 3 * TILE,
                type: "bed",
                solid: true
            },
            {
                id: "desk",
                x: 18 * TILE,
                y: 3 * TILE,
                w: 5 * TILE,
                h: 2 * TILE,
                type: "desk",
                solid: true
            },
            {
                id: "alarm",
                x: 19 * TILE,
                y: 2 * TILE,
                w: TILE,
                h: TILE,
                type: "alarm",
                interactive: true
            },
            {
                id: "backpack",
                x: 20 * TILE,
                y: 6 * TILE,
                w: 2 * TILE,
                h: 2 * TILE,
                type: "backpack",
                interactive: true
            },
            {
                id: "window",
                x: 10 * TILE,
                y: 0,
                w: 5 * TILE,
                h: TILE,
                type: "window",
                solid: true
            },
            {
                id: "door",
                x: 25 * TILE,
                y: 7 * TILE,
                w: TILE,
                h: 3 * TILE,
                type: "door",
                interactive: true
            }
        ]
    },

    kitchen: {
        width: 25,
        height: 16,
        playerStart: { x: 5 * TILE, y: 10 * TILE },

        objects: [
            {
                id: "counter",
                x: 2 * TILE,
                y: 2 * TILE,
                w: 9 * TILE,
                h: 2 * TILE,
                type: "counter",
                solid: true
            },
            {
                id: "fridge",
                x: 2 * TILE,
                y: 5 * TILE,
                w: 3 * TILE,
                h: 5 * TILE,
                type: "fridge",
                solid: true
            },
            {
                id: "table",
                x: 13 * TILE,
                y: 5 * TILE,
                w: 6 * TILE,
                h: 4 * TILE,
                type: "table",
                solid: true
            },
            {
                id: "breakfast",
                x: 15 * TILE,
                y: 6 * TILE,
                w: 2 * TILE,
                h: TILE,
                type: "breakfast",
                interactive: true
            },
            {
                id: "mother",
                x: 8 * TILE,
                y: 8 * TILE,
                w: 24,
                h: 28,
                type: "mother",
                interactive: true
            },
            {
                id: "exit",
                x: 22 * TILE,
                y: 7 * TILE,
                w: TILE,
                h: 3 * TILE,
                type: "door",
                interactive: true
            }
        ]
    },

    street: {
        width: 45,
        height: 22,
        playerStart: { x: 5 * TILE, y: 13 * TILE },

        objects: [
            {
                id: "house",
                x: 1 * TILE,
                y: 2 * TILE,
                w: 11 * TILE,
                h: 9 * TILE,
                type: "house",
                solid: true
            },
            {
                id: "houseDoor",
                x: 9 * TILE,
                y: 10 * TILE,
                w: TILE,
                h: TILE,
                type: "door",
                interactive: true
            },
            {
                id: "tree1",
                x: 15 * TILE,
                y: 3 * TILE,
                w: 2 * TILE,
                h: 3 * TILE,
                type: "tree",
                solid: true
            },
            {
                id: "tree2",
                x: 26 * TILE,
                y: 5 * TILE,
                w: 2 * TILE,
                h: 3 * TILE,
                type: "tree",
                solid: true
            },
            {
                id: "tree3",
                x: 36 * TILE,
                y: 2 * TILE,
                w: 2 * TILE,
                h: 3 * TILE,
                type: "tree",
                solid: true
            },
            {
                id: "crow",
                x: 23 * TILE,
                y: 5 * TILE,
                w: 28,
                h: 25,
                type: "crow",
                interactive: true
            },
            {
                id: "busstop",
                x: 37 * TILE,
                y: 13 * TILE,
                w: 4 * TILE,
                h: 3 * TILE,
                type: "busstop",
                interactive: true
            }
        ]
    },

    school: {
        width: 32,
        height: 18,
        playerStart: { x: 16 * TILE, y: 14 * TILE },

        objects: [
            {
                id: "school",
                x: 5 * TILE,
                y: 2 * TILE,
                w: 22 * TILE,
                h: 9 * TILE,
                type: "school",
                solid: true
            },
            {
                id: "schooldoor",
                x: 15 * TILE,
                y: 10 * TILE,
                w: 2 * TILE,
                h: TILE,
                type: "door",
                interactive: true
            }
        ]
    }
};

function currentRoom() {
    return rooms[game.room];
}

function showNotification(text) {
    const el = document.getElementById("notification");

    el.textContent = text;
    el.style.opacity = "1";

    clearTimeout(showNotification.timer);

    showNotification.timer = setTimeout(() => {
        el.style.opacity = "0";
    }, 2200);
}

function updateObjective() {
    let text = "";

    if (!game.state.alarmOff) {
        text = "Schalte den Wecker aus.";
    } else if (!game.inventory.backpack) {
        text = "Hol deinen Rucksack.";
    } else if (!game.state.talkedToMother) {
        text = "Sprich mit deiner Mutter.";
    } else if (!game.state.breakfastDone) {
        text = "Iss etwas, bevor du gehst.";
    } else if (game.room === "bedroom" || game.room === "kitchen") {
        text = "Verlass das Haus.";
    } else if (!game.state.crowSeen) {
        text = "Geh zur Bushaltestelle.";
    } else if (!game.state.busArrived) {
        text = "Warte auf den Schulbus.";
    } else if (!game.state.boardedBus) {
        text = "Steig in den Schulbus.";
    } else {
        text = "Betritt das Schulgebäude.";
    }

    document.getElementById("objectiveText").textContent = text;
}

function updateInventory() {
    document
        .getElementById("slot-backpack")
        .classList.toggle("has-item", game.inventory.backpack);

    document
        .getElementById("slot-breakfast")
        .classList.toggle("has-item", game.inventory.breakfast);

    document
        .getElementById("slot-key")
        .classList.toggle("has-item", game.inventory.key);
}

function saveGame() {
    localStorage.setItem(
        "leo_lukas_save",
        JSON.stringify({
            room: game.room,
            inventory: game.inventory,
            state: game.state
        })
    );
}

function loadGame() {
    const save = localStorage.getItem("leo_lukas_save");

    if (!save) return;

    try {
        const data = JSON.parse(save);

        game.room = data.room || "bedroom";

        Object.assign(game.inventory, data.inventory || {});
        Object.assign(game.state, data.state || {});

        const start = currentRoom().playerStart;

        game.player.x = start.x;
        game.player.y = start.y;

        updateInventory();
        updateObjective();
    } catch {
        localStorage.removeItem("leo_lukas_save");
    }
}

function resetGame() {
    localStorage.removeItem("leo_lukas_save");

    location.reload();
}

function changeRoom(roomName) {
    game.room = roomName;

    const start = rooms[roomName].playerStart;

    game.player.x = start.x;
    game.player.y = start.y;

    game.camera.x = 0;
    game.camera.y = 0;

    showNotification(roomName === "street" ? "Draußen – kalter Herbstmorgen." : "");

    updateObjective();
    saveGame();
}

function openDialogue(name, lines, callback = null) {
    game.dialogue = {
        name,
        lines,
        callback
    };

    game.dialogueIndex = 0;

    document.getElementById("dialogue").classList.remove("hidden");

    renderDialogue();
}

function renderDialogue() {
    if (!game.dialogue) return;

    document.getElementById("dialogueName").textContent =
        game.dialogue.name;

    document.getElementById("dialogueText").textContent =
        game.dialogue.lines[game.dialogueIndex];

    document.getElementById("dialogueNext").textContent =
        game.dialogueIndex >= game.dialogue.lines.length - 1
            ? "SCHLIESSEN"
            : "WEITER";
}

function nextDialogue() {
    if (!game.dialogue) return;

    if (game.dialogueIndex < game.dialogue.lines.length - 1) {
        game.dialogueIndex++;
        renderDialogue();
        return;
    }

    const callback = game.dialogue.callback;

    game.dialogue = null;

    document.getElementById("dialogue").classList.add("hidden");

    if (callback) callback();

    updateObjective();
    saveGame();
}

document
    .getElementById("dialogueNext")
    .addEventListener("click", nextDialogue);

function distance(a, b) {
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;

    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;

    return Math.hypot(ax - bx, ay - by);
}

function getNearbyObject() {
    const room = currentRoom();

    let closest = null;
    let closestDistance = Infinity;

    for (const obj of room.objects) {
        if (!obj.interactive) continue;

        const d = distance(game.player, obj);

        if (d < 65 && d < closestDistance) {
            closest = obj;
            closestDistance = d;
        }
    }

    return closest;
}

function updateInteractionUI() {
    const element = document.getElementById("interaction");
    const text = document.getElementById("interactionText");

    if (game.dialogue) {
        element.style.display = "none";
        return;
    }

    const obj = getNearbyObject();

    if (!obj) {
        element.style.display = "none";
        return;
    }

    const labels = {
        alarm: "Wecker ausschalten",
        backpack: "Rucksack nehmen",
        mother: "Mit Mutter sprechen",
        breakfast: "Frühstück nehmen",
        door: "Tür öffnen",
        crow: "Raben beobachten",
        busstop: "Auf den Bus warten"
    };

    text.textContent = labels[obj.type] || "Interagieren";

    element.style.display = "flex";
}

function interact() {
    if (game.paused) return;

    if (game.dialogue) {
        nextDialogue();
        return;
    }

    const obj = getNearbyObject();

    if (!obj) return;

    switch (obj.type) {

        case "alarm":
            if (!game.state.alarmOff) {
                game.state.alarmOff = true;

                openDialogue(
                    "Leo",
                    [
                        "Endlich Ruhe.",
                        "06:00 Uhr. Natürlich.",
                        "Nur noch ein ganz normaler Schultag."
                    ]
                );

                showNotification("Der Wecker ist aus.");
            }
            break;

        case "backpack":
            if (!game.inventory.backpack) {
                game.inventory.backpack = true;

                openDialogue(
                    "Leo",
                    [
                        "Rucksack. Bücher. Hefte.",
                        "Alles da.",
                        "Warum fühlt sich dieses Ding jedes Jahr schwerer an?"
                    ]
                );
            }
            break;

        case "mother":
            if (!game.state.talkedToMother) {
                game.state.talkedToMother = true;

                openDialogue(
                    "Mutter",
                    [
                        "Leo! Endlich bist du wach.",
                        "Der Bus kommt gleich. Hast du deinen Rucksack?",
                        "Und bitte iss wenigstens ein bisschen Frühstück.",
                        "Leo: Ja, ja. Ich hab's gehört."
                    ]
                );
            } else {
                openDialogue(
                    "Mutter",
                    [
                        "Der Bus wartet nicht auf dich.",
                        "Und vergiss dein Frühstück nicht."
                    ]
                );
            }
            break;

        case "breakfast":
            if (!game.inventory.backpack) {
                showNotification("Vielleicht solltest du zuerst deinen Rucksack holen.");
                return;
            }

            if (!game.state.breakfastDone) {
                game.state.breakfastDone = true;
                game.inventory.breakfast = true;

                openDialogue(
                    "Leo",
                    [
                        "Ein paar Bissen müssen reichen.",
                        "Immerhin besser als mit leerem Magen in Mathe zu sitzen."
                    ]
                );
            }
            break;

        case "door":
            if (game.room === "bedroom") {
                if (!game.inventory.backpack) {
                    showNotification("Mein Rucksack fehlt noch.");
                    return;
                }

                changeRoom("kitchen");
            } else if (game.room === "kitchen") {
                if (!game.state.breakfastDone) {
                    showNotification("Meine Mutter wird sauer, wenn ich ohne Frühstück gehe.");
                    return;
                }

                changeRoom("street");
            }
            break;

        case "crow":
            if (!game.state.crowSeen) {
                game.state.crowSeen = true;

                openDialogue(
                    "Leo",
                    [
                        "Ein Rabe.",
                        "Er sitzt einfach da und sieht aus, als würde er die ganze Stadt beobachten.",
                        "Leo: Warum kann ich nicht einfach fliegen, wohin ich will?"
                    ]
                );
            } else {
                showNotification("Der Rabe beobachtet dich.");
            }
            break;

        case "busstop":
            if (!game.state.crowSeen) {
                showNotification("Ich habe gerade etwas Interessantes entdeckt.");
                return;
            }

            if (!game.state.busArrived) {
                game.state.busArrived = true;

                openDialogue(
                    "Leo",
                    [
                        "Da ist er.",
                        "Der gelbe Bus taucht aus dem Nebel auf.",
                        "Na schön. Dann geht es wohl los."
                    ]
                );

                showNotification("Der Schulbus ist angekommen.");
            } else if (!game.state.boardedBus) {
                game.state.boardedBus = true;

                openDialogue(
                    "Leo",
                    [
                        "Die Tür zischt auf.",
                        "Leo steigt ein und setzt sich wie immer ganz nach hinten ans Fenster.",
                        "Die Stadt zieht langsam vorbei."
                    ],
                    () => {
                        changeRoom("school");
                    }
                );
            }
            break;
    }

    updateInventory();
    updateObjective();
    saveGame();
}

function togglePause() {
    if (game.dialogue) return;

    game.paused = !game.paused;

    document
        .getElementById("pauseMenu")
        .classList.toggle("hidden", !game.paused);
}

document
    .getElementById("resumeButton")
    .addEventListener("click", togglePause);

document
    .getElementById("resetButton")
    .addEventListener("click", resetGame);

/* -----------------------------
   MOBILE CONTROLS
----------------------------- */

document.querySelectorAll("[data-key]").forEach(button => {
    const key = button.dataset.key;

    button.addEventListener("pointerdown", () => {
        keys[key] = true;
    });

    button.addEventListener("pointerup", () => {
        keys[key] = false;
    });

    button.addEventListener("pointerleave", () => {
        keys[key] = false;
    });
});

document
    .getElementById("mobileInteract")
    .addEventListener("click", interact);

/* -----------------------------
   COLLISION
----------------------------- */

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function isBlocked(x, y) {
    const playerRect = {
        x,
        y,
        w: game.player.w,
        h: game.player.h
    };

    const room = currentRoom();

    if (
        x < TILE ||
        y < TILE ||
        x + game.player.w > room.width * TILE - TILE ||
        y + game.player.h > room.height * TILE - TILE
    ) {
        return true;
    }

    for (const obj of room.objects) {
        if (!obj.solid) continue;

        if (rectsOverlap(playerRect, obj)) {
            return true;
        }
    }

    return false;
}

function movePlayer() {
    if (game.dialogue || game.paused) {
        game.player.moving = false;
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"] || keys["up"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"] || keys["down"]) dy += 1;
    if (keys["a"] || keys["arrowleft"] || keys["left"]) dx -= 1;
    if (keys["d"] || keys["arrowright"] || keys["right"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
        const length = Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        const speed = game.player.speed;

        if (Math.abs(dx) > Math.abs(dy)) {
            game.player.direction = dx > 0 ? "right" : "left";
        } else {
            game.player.direction = dy > 0 ? "down" : "up";
        }

        const nx = game.player.x + dx * speed;
        const ny = game.player.y + dy * speed;

        if (!isBlocked(nx, game.player.y)) {
            game.player.x = nx;
        }

        if (!isBlocked(game.player.x, ny)) {
            game.player.y = ny;
        }

        game.player.moving = true;
        game.player.frame += 0.15;
    } else {
        game.player.moving = false;
    }
}

/* -----------------------------
   CAMERA
----------------------------- */

function updateCamera() {
    const room = currentRoom();

    const targetX =
        game.player.x -
        W / 2 +
        game.player.w / 2;

    const targetY =
        game.player.y -
        H / 2 +
        game.player.h / 2;

    const maxX = Math.max(0, room.width * TILE - W);
    const maxY = Math.max(0, room.height * TILE - H);

    game.camera.x = Math.max(
        0,
        Math.min(maxX, targetX)
    );

    game.camera.y = Math.max(
        0,
        Math.min(maxY, targetY)
    );
}

/* -----------------------------
   DRAWING
----------------------------- */

function screenX(x) {
    return Math.floor(x - game.camera.x);
}

function screenY(y) {
    return Math.floor(y - game.camera.y);
}

function drawRoom() {
    const room = currentRoom();

    ctx.fillStyle = "#19252a";
    ctx.fillRect(0, 0, W, H);

    if (game.room === "bedroom") {
        drawBedroom(room);
    } else if (game.room === "kitchen") {
        drawKitchen(room);
    } else if (game.room === "street") {
        drawStreet(room);
    } else if (game.room === "school") {
        drawSchool(room);
    }

    drawObjects(room);
    drawPlayer();
}

function drawFloorTile(x, y, color1, color2) {
    ctx.fillStyle = color1;
    ctx.fillRect(screenX(x), screenY(y), TILE, TILE);

    ctx.strokeStyle = color2;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(screenX(x), screenY(y + TILE - 1));
    ctx.lineTo(screenX(x + TILE), screenY(y + TILE - 1));
    ctx.stroke();
}

function drawWalls(room, wallColor = "#34383b") {
    ctx.fillStyle = wallColor;

    ctx.fillRect(
        screenX(0),
        screenY(0),
        room.width * TILE,
        TILE
    );

    ctx.fillRect(
        screenX(0),
        screenY(0),
        TILE,
        room.height * TILE
    );

    ctx.fillRect(
        screenX(0),
        screenY((room.height - 1) * TILE),
        room.width * TILE,
        TILE
    );

    ctx.fillRect(
        screenX((room.width - 1) * TILE),
        screenY(0),
        TILE,
        room.height * TILE
    );
}

function drawBedroom(room) {
    for (let y = 1; y < room.height - 1; y++) {
        for (let x = 1; x < room.width - 1; x++) {
            drawFloorTile(
                x * TILE,
                y * TILE,
                (x + y) % 2 ? "#74584b" : "#6b5145",
                "#5a443b"
            );
        }
    }

    drawWalls(room, "#34373c");

    /* Teppich */
    ctx.fillStyle = "#4e4b52";
    ctx.fillRect(
        screenX(8 * TILE),
        screenY(8 * TILE),
        12 * TILE,
        5 * TILE
    );

    ctx.strokeStyle = "#716c72";
    ctx.strokeRect(
        screenX(8 * TILE + 5),
        screenY(8 * TILE + 5),
        12 * TILE - 10,
        5 * TILE - 10
    );
}

function drawKitchen(room) {
    for (let y = 1; y < room.height - 1; y++) {
        for (let x = 1; x < room.width - 1; x++) {
            const c =
                (x + y) % 2
                    ? "#d1c6ad"
                    : "#c6bba4";

            drawFloorTile(
                x * TILE,
                y * TILE,
                c,
                "#aaa18f"
            );
        }
    }

    drawWalls(room, "#41433f");

    /* Fliesen */
    ctx.strokeStyle = "#aaa18f";

    for (let x = 1; x < room.width - 1; x++) {
        ctx.beginPath();
        ctx.moveTo(screenX(x * TILE), screenY(TILE));
        ctx.lineTo(screenX(x * TILE), screenY(5 * TILE));
        ctx.stroke();
    }

    /* Fenster */
    ctx.fillStyle = "#7897a4";
    ctx.fillRect(
        screenX(14 * TILE),
        screenY(TILE),
        7 * TILE,
        3 * TILE
    );

    ctx.strokeStyle = "#d5d8d5";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        screenX(14 * TILE),
        screenY(TILE),
        7 * TILE,
        3 * TILE
    );

    ctx.beginPath();
    ctx.moveTo(screenX(17.5 * TILE), screenY(TILE));
    ctx.lineTo(screenX(17.5 * TILE), screenY(4 * TILE));
    ctx.moveTo(screenX(14 * TILE), screenY(2.5 * TILE));
    ctx.lineTo(screenX(21 * TILE), screenY(2.5 * TILE));
    ctx.stroke();
}

function drawStreet(room) {
    ctx.fillStyle = "#78816d";
    ctx.fillRect(0, 0, W, H);

    /* Gras */
    for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
            if ((x * 17 + y * 7) % 9 === 0) {
                ctx.fillStyle = "#68755f";
                ctx.fillRect(
                    screenX(x * TILE + 8),
                    screenY(y * TILE + 12),
                    2,
                    7
                );
            }
        }
    }

    /* Straße */
    ctx.fillStyle = "#3c4145";

    ctx.fillRect(
        screenX(0),
        screenY(11 * TILE),
        room.width * TILE,
        7 * TILE
    );

    /* Straßenrand */
    ctx.fillStyle = "#b1a993";

    ctx.fillRect(
        screenX(0),
        screenY(10 * TILE),
        room.width * TILE,
        TILE
    );

    ctx.fillRect(
        screenX(0),
        screenY(18 * TILE),
        room.width * TILE,
        TILE
    );

    /* Mittelmarkierungen */
    ctx.fillStyle = "#d6c978";

    for (let x = 0; x < room.width; x += 4) {
        ctx.fillRect(
            screenX(x * TILE),
            screenY(14.2 * TILE),
            2 * TILE,
            5
        );
    }

    /* Nebel */
    const gradient = ctx.createLinearGradient(0, 0, 0, H);

    gradient.addColorStop(0, "rgba(215,225,218,0.42)");
    gradient.addColorStop(0.45, "rgba(215,225,218,0.12)");
    gradient.addColorStop(1, "rgba(215,225,218,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
}

function drawSchool(room) {
    ctx.fillStyle = "#777b76";
    ctx.fillRect(0, 0, W, H);

    /* Hof */
    for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
            if ((x + y) % 2 === 0) {
                ctx.fillStyle = "#858983";
                ctx.fillRect(
                    screenX(x * TILE),
                    screenY(y * TILE),
                    TILE,
                    TILE
                );
            }
        }
    }
}

function drawObjects(room) {
    for (const obj of room.objects) {
        drawObject(obj);
    }
}

function drawObject(obj) {
    const x = screenX(obj.x);
    const y = screenY(obj.y);

    switch (obj.type) {

        case "bed":
            drawBed(x, y);
            break;

        case "desk":
            drawDesk(x, y);
            break;

        case "alarm":
            drawAlarm(x, y);
            break;

        case "backpack":
            drawBackpack(x, y);
            break;

        case "window":
            drawWindow(x, y, obj.w, obj.h);
            break;

        case "counter":
            drawCounter(x, y, obj.w, obj.h);
            break;

        case "fridge":
            drawFridge(x, y);
            break;

        case "table":
            drawTable(x, y);
            break;

        case "breakfast":
            drawBreakfast(x, y);
            break;

        case "mother":
            drawMother(x, y);
            break;

        case "door":
            drawDoor(x, y, obj.w, obj.h);
            break;

        case "house":
            drawHouse(x, y, obj.w, obj.h);
            break;

        case "tree":
            drawTree(x, y);
            break;

        case "crow":
            drawCrow(x, y);
            break;

        case "busstop":
            drawBusStop(x, y);
            break;

        case "school":
            drawSchoolBuilding(x, y, obj.w, obj.h);
            break;
    }
}

/* -----------------------------
   PIXEL OBJECTS
----------------------------- */

function drawBed(x, y) {
    ctx.fillStyle = "#3d3030";
    ctx.fillRect(x, y, 128, 96);

    ctx.fillStyle = "#9d5f65";
    ctx.fillRect(x + 6, y + 7, 116, 80);

    ctx.fillStyle = "#d7c8b5";
    ctx.fillRect(x + 9, y + 10, 42, 25);

    ctx.fillStyle = "#b06f78";
    ctx.fillRect(x + 50, y + 12, 67, 64);

    ctx.fillStyle = "#493638";
    ctx.fillRect(x + 8, y + 86, 112, 7);
}

function drawDesk(x, y) {
    ctx.fillStyle = "#4a3024";
    ctx.fillRect(x, y, 160, 64);

    ctx.fillStyle = "#745039";
    ctx.fillRect(x + 5, y + 5, 150, 25);

    ctx.fillStyle = "#35241d";
    ctx.fillRect(x + 10, y + 45, 12, 55);
    ctx.fillRect(x + 138, y + 45, 12, 55);

    ctx.fillStyle = "#ddd1b7";
    ctx.fillRect(x + 22, y + 12, 32, 5);
}

function drawAlarm(x, y) {
    ctx.fillStyle = "#2a2c30";
    ctx.fillRect(x + 4, y + 7, 24, 18);

    ctx.fillStyle = "#a9b4a0";
    ctx.fillRect(x + 8, y + 10, 16, 9);

    ctx.fillStyle = game.state.alarmOff ? "#394039" : "#d8d17b";
    ctx.fillRect(x + 10, y + 12, 2, 4);
    ctx.fillRect(x + 14, y + 12, 2, 4);

    ctx.fillStyle = "#202226";
    ctx.fillRect(x + 1, y + 2, 7, 6);
    ctx.fillRect(x + 24, y + 2, 7, 6);
}

function drawBackpack(x, y) {
    if (game.inventory.backpack) return;

    ctx.fillStyle = "#513c34";
    ctx.fillRect(x + 6, y + 4, 46, 50);

    ctx.fillStyle = "#865c48";
    ctx.fillRect(x + 2, y + 13, 54, 38);

    ctx.fillStyle = "#b47b58";
    ctx.fillRect(x + 10, y + 23, 38, 5);

    ctx.fillStyle = "#342a27";
    ctx.fillRect(x + 22, y + 5, 10, 10);
}

function drawWindow(x, y, w, h) {
    ctx.fillStyle = "#647d89";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#afc6ca";
    ctx.fillRect(x + 6, y + 6, w - 12, h - 12);

    ctx.fillStyle = "#778e96";

    ctx.fillRect(
        x + w / 2 - 2,
        y,
        4,
        h
    );

    ctx.fillRect(
        x,
        y + h / 2 - 2,
        w,
        4
    );
}

function drawCounter(x, y, w, h) {
    ctx.fillStyle = "#56463a";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#8a6e55";
    ctx.fillRect(x, y, w, 16);

    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = "#42362f";
        ctx.fillRect(
            x + 15 + i * 50,
            y + 28,
            34,
            25
        );
    }
}

function drawFridge(x, y) {
    ctx.fillStyle = "#bfc1bd";
    ctx.fillRect(x, y, 96, 160);

    ctx.fillStyle = "#d6d7d1";
    ctx.fillRect(x + 7, y + 7, 82, 146);

    ctx.fillStyle = "#777b78";
    ctx.fillRect(x + 72, y + 35, 5, 32);
}

function drawTable(x, y) {
    ctx.fillStyle = "#674633";
    ctx.fillRect(x, y, 192, 128);

    ctx.fillStyle = "#8b5c40";
    ctx.fillRect(x + 8, y + 8, 176, 45);

    ctx.fillStyle = "#523729";
    ctx.fillRect(x + 14, y + 70, 12, 55);
    ctx.fillRect(x + 166, y + 70, 12, 55);
}

function drawBreakfast(x, y) {
    if (game.state.breakfastDone) return;

    ctx.fillStyle = "#ded7c5";
    ctx.fillRect(x + 4, y + 4, 52, 28);

    ctx.fillStyle = "#c0834a";
    ctx.fillRect(x + 13, y + 8, 34, 15);

    ctx.fillStyle = "#f0d9a5";
    ctx.fillRect(x + 18, y + 11, 24, 7);
}

function drawMother(x, y) {
    /* Beine */
    ctx.fillStyle = "#303b48";
    ctx.fillRect(x + 5, y + 26, 7, 18);
    ctx.fillRect(x + 15, y + 26, 7, 18);

    /* Körper */
    ctx.fillStyle = "#60798b";
    ctx.fillRect(x + 3, y + 10, 21, 21);

    /* Haare */
    ctx.fillStyle = "#5a4134";
    ctx.fillRect(x + 3, y, 22, 15);

    /* Gesicht */
    ctx.fillStyle = "#d8a27e";
    ctx.fillRect(x + 7, y + 7, 14, 12);

    ctx.fillStyle = "#252326";
    ctx.fillRect(x + 10, y + 11, 2, 2);
    ctx.fillRect(x + 17, y + 11, 2, 2);
}

function drawDoor(x, y, w, h) {
    ctx.fillStyle = "#573c2d";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#745039";
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);

    ctx.fillStyle = "#d4b66c";
    ctx.fillRect(x + w - 10, y + h / 2, 4, 4);
}

function drawHouse(x, y, w, h) {
    ctx.fillStyle = "#c2a47c";
    ctx.fillRect(x, y, w, h);

    /* Dach */
    ctx.fillStyle = "#653f3d";

    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + w / 2, y - 70);
    ctx.lineTo(x + w + 15, y);
    ctx.closePath();
    ctx.fill();

    /* Fenster */
    ctx.fillStyle = "#6c8b94";

    ctx.fillRect(x + 50, y + 70, 70, 55);
    ctx.fillRect(x + 205, y + 70, 70, 55);

    ctx.strokeStyle = "#ddd6bd";
    ctx.lineWidth = 4;

    ctx.strokeRect(x + 50, y + 70, 70, 55);
    ctx.strokeRect(x + 205, y + 70, 70, 55);

    /* Tür */
    ctx.fillStyle = "#573a2e";
    ctx.fillRect(x + 135, y + 135, 60, 105);
}

function drawTree(x, y) {
    ctx.fillStyle = "#49362a";
    ctx.fillRect(x + 23, y + 48, 18, 48);

    const leaves = [
        [0, 20],
        [18, 5],
        [40, 17],
        [12, 37],
        [33, 39]
    ];

    for (const [dx, dy] of leaves) {
        ctx.fillStyle = "#4f604b";
        ctx.fillRect(x + dx, y + dy, 40, 38);

        ctx.fillStyle = "#657653";
        ctx.fillRect(x + dx + 8, y + dy + 5, 23, 12);
    }
}

function drawCrow(x, y) {
    if (game.state.crowSeen) {
        ctx.fillStyle = "#181b1f";
    } else {
        ctx.fillStyle = "#25292e";
    }

    ctx.fillRect(x + 8, y + 8, 20, 15);

    ctx.fillStyle = "#111316";
    ctx.fillRect(x + 2, y + 13, 15, 7);

    /* Schnabel */
    ctx.fillStyle = "#75694c";
    ctx.fillRect(x + 28, y + 13, 8, 4);

    /* Beine */
    ctx.fillStyle = "#25221e";
    ctx.fillRect(x + 12, y + 22, 2, 7);
    ctx.fillRect(x + 21, y + 22, 2, 7);

    /* Flügel */
    ctx.fillStyle = "#353a40";
    ctx.fillRect(x + 5, y + 3, 17, 9);
}

function drawBusStop(x, y) {
    ctx.fillStyle = "#41484d";
    ctx.fillRect(x + 15, y, 6, 95);

    ctx.fillStyle = "#68737a";
    ctx.fillRect(x + 18, y + 3, 105, 5);

    ctx.fillStyle = "rgba(170,190,194,0.35)";
    ctx.fillRect(x + 22, y + 10, 90, 50);

    ctx.fillStyle = "#526069";
    ctx.fillRect(x + 25, y + 61, 85, 12);

    ctx.fillStyle = "#d7c675";
    ctx.fillRect(x + 42, y + 15, 20, 20);
}

function drawSchoolBuilding(x, y, w, h) {
    ctx.fillStyle = "#8d8374";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#62574d";

    ctx.fillRect(
        x - 10,
        y,
        w + 20,
        32
    );

    /* Fenster */
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 6; col++) {
            ctx.fillStyle = "#647c83";

            ctx.fillRect(
                x + 35 + col * 100,
                y + 65 + row * 95,
                60,
                55
            );

            ctx.strokeStyle = "#c2c5b8";
            ctx.lineWidth = 4;

            ctx.strokeRect(
                x + 35 + col * 100,
                y + 65 + row * 95,
                60,
                55
            );
        }
    }

    ctx.fillStyle = "#4b3d36";

    ctx.fillRect(
        x + w / 2 - 45,
        y + h - 115,
        90,
        115
    );

    ctx.fillStyle = "#d5c879";

    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "SCHULE",
        x + w / 2,
        y + 43
    );

    ctx.textAlign = "left";
}

/* -----------------------------
   PLAYER
----------------------------- */

function drawPlayer() {
    const p = game.player;

    const x = screenX(p.x);
    const y = screenY(p.y);

    const walkOffset =
        p.moving
            ? Math.sin(p.frame * 5) * 2
            : 0;

    /* Schatten */
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(
        x - 2,
        y + 22,
        24,
        6
    );

    /* Beine */
    ctx.fillStyle = "#252b38";

    if (p.moving) {
        ctx.fillRect(x + 3, y + 21 + walkOffset, 6, 7);
        ctx.fillRect(x + 13, y + 21 - walkOffset, 6, 7);
    } else {
        ctx.fillRect(x + 3, y + 21, 6, 7);
        ctx.fillRect(x + 13, y + 21, 6, 7);
    }

    /* Körper */
    ctx.fillStyle = "#526b83";
    ctx.fillRect(x + 2, y + 8, 20, 17);

    /* Jacke */
    ctx.fillStyle = "#718aa0";
    ctx.fillRect(x + 5, y + 9, 14, 14);

    /* Hals */
    ctx.fillStyle = "#c99170";
    ctx.fillRect(x + 8, y + 5, 7, 6);

    /* Haare */
    ctx.fillStyle = "#3a302d";
    ctx.fillRect(x + 5, y, 14, 9);
    ctx.fillRect(x + 3, y + 4, 4, 7);

    /* Gesicht */
    ctx.fillStyle = "#d4a078";
    ctx.fillRect(x + 7, y + 5, 11, 9);

    /* Augen */
    ctx.fillStyle = "#24262a";

    if (p.direction === "left") {
        ctx.fillRect(x + 7, y + 8, 2, 2);
    } else if (p.direction === "right") {
        ctx.fillRect(x + 16, y + 8, 2, 2);
    } else {
        ctx.fillRect(x + 9, y + 8, 2, 2);
        ctx.fillRect(x + 15, y + 8, 2, 2);
    }

    /* Rucksack */
    if (game.inventory.backpack) {
        ctx.fillStyle = "#79513f";
        ctx.fillRect(x - 3, y + 10, 5, 13);
    }
}

/* -----------------------------
   GAME LOOP
----------------------------- */

let lastTime = performance.now();

function gameLoop(time) {
    const delta = Math.min(50, time - lastTime);

    lastTime = time;

    movePlayer();
    updateCamera();
    updateInteractionUI();

    drawRoom();

    requestAnimationFrame(gameLoop);
}

loadGame();
updateInventory();
updateObjective();

requestAnimationFrame(gameLoop);

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 40;

const TOWER_TYPES = {
    basic: {
        name: "Sentry",
        cost: 100,
        range: 150,
        fireRate: 40,
        damage: 15,
        color: "#3498db",
        upgrades: [
            { name: "Twin Sentry", cost: 80, range: 170, fireRate: 30, damage: 25, color: "#2980b9" },
            { name: "Laser Turret", cost: 150, range: 200, fireRate: 20, damage: 45, color: "#1c5980" },
            { name: "Hyper Railgun", cost: 300, range: 350, fireRate: 60, damage: 250, color: "#154360" }
        ]
    },
    slow: {
        name: "Frost Tower",
        cost: 150,
        range: 130,
        fireRate: 40,
        damage: 10,
        slowAmount: 0.6,
        color: "#00d2ff",
        upgrades: [
            { name: "Ice Beam", cost: 100, range: 160, fireRate: 35, damage: 20, slowAmount: 0.5, color: "#00b2ee" },
            { name: "Blizzard Emitter", cost: 200, range: 200, fireRate: 25, damage: 35, slowAmount: 0.4, color: "#0091bb" },
            { name: "Absolute Zero", cost: 400, range: 250, fireRate: 20, damage: 60, slowAmount: 0.25, color: "#007090" }
        ]
    },
    area: {
        name: "Bomber",
        cost: 200,
        range: 160,
        fireRate: 90,
        damage: 50,
        splashRadius: 70,
        color: "#e67e22",
        upgrades: [
            { name: "Missile Pod", cost: 180, range: 200, fireRate: 70, damage: 85, splashRadius: 90, color: "#d35400" },
            { name: "Heavy Ordnance", cost: 250, range: 240, fireRate: 60, damage: 150, splashRadius: 120, color: "#b34700" },
            { name: "Nuclear Battery", cost: 500, range: 350, fireRate: 50, damage: 400, splashRadius: 200, color: "#8a3100" }
        ]
    }
};

const ZOMBIE_TYPES = {
    normal: {
        name: "Walker",
        health: 50,
        speed: 1,
        color: "#27ae60",
        skinColor: "#7d8471",
        reward: 10
    },
    fast: {
        name: "Runner",
        health: 30,
        speed: 2.5,
        color: "#2ecc71",
        skinColor: "#a8b89a",
        reward: 15
    },
    tank: {
        name: "Brute",
        health: 200,
        speed: 0.5,
        color: "#1e8449",
        skinColor: "#5a6352",
        reward: 50
    },
    crawler: {
        name: "Crawler",
        health: 25,
        speed: 1.8,
        color: "#6b8e23",
        skinColor: "#556b2f",
        reward: 12
    },
    boss: {
        name: "Zombie King",
        health: 500,
        speed: 0.3,
        color: "#8b0000",
        skinColor: "#4a0000",
        reward: 200
    }
};

// Wave definitions - each wave has specific zombie spawns
const WAVE_DEFINITIONS = [
    { zombies: [{type: 'normal', count: 5}] },
    { zombies: [{type: 'normal', count: 8}] },
    { zombies: [{type: 'normal', count: 6}, {type: 'fast', count: 3}] },
    { zombies: [{type: 'normal', count: 8}, {type: 'fast', count: 5}] },
    { zombies: [{type: 'normal', count: 5}, {type: 'tank', count: 2}] },
    { zombies: [{type: 'fast', count: 10}, {type: 'crawler', count: 5}] },
    { zombies: [{type: 'normal', count: 10}, {type: 'tank', count: 3}] },
    { zombies: [{type: 'crawler', count: 8}, {type: 'fast', count: 8}] },
    { zombies: [{type: 'tank', count: 5}, {type: 'normal', count: 10}] },
    { zombies: [{type: 'normal', count: 5}, {type: 'boss', count: 1}] },
];

// After wave 10, endless mode with scaling difficulty
function getEndlessWave(waveNum) {
    const scale = Math.floor((waveNum - 10) / 5) + 1;
    const zombies = [
        {type: 'normal', count: 10 + scale * 3},
        {type: 'fast', count: 5 + scale * 2},
        {type: 'tank', count: 2 + scale},
        {type: 'crawler', count: 4 + scale * 2}
    ];
    if (waveNum % 5 === 0) {
        zombies.push({type: 'boss', count: Math.floor(waveNum / 10)});
    }
    return { zombies };
}

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
            { name: "Twin Sentry", cost: 100, range: 170, fireRate: 30, damage: 25, color: "#2980b9" },
            { name: "Laser Turret", cost: 250, range: 200, fireRate: 20, damage: 60, color: "#1c5980" },
            { name: "Hyper Railgun", cost: 600, range: 400, fireRate: 15, damage: 150, color: "#154360" }
        ]
    },
    slow: {
        name: "Frost Tower",
        cost: 125,
        range: 130,
        fireRate: 40,
        damage: 10,
        slowAmount: 0.6,
        color: "#00d2ff",
        upgrades: [
            { name: "Ice Beam", cost: 150, range: 160, fireRate: 35, damage: 30, slowAmount: 0.5, color: "#00b2ee" },
            { name: "Blizzard Emitter", cost: 300, range: 220, fireRate: 25, damage: 70, slowAmount: 0.4, color: "#0091bb" },
            { name: "Absolute Zero", cost: 800, range: 300, fireRate: 20, damage: 150, slowAmount: 0.2, color: "#007090" }
        ]
    },
    area: {
        name: "Bomber",
        cost: 250,
        range: 160,
        fireRate: 90,
        damage: 50,
        splashRadius: 70,
        color: "#e67e22",
        upgrades: [
            { name: "Missile Pod", cost: 250, range: 200, fireRate: 70, damage: 100, splashRadius: 100, color: "#d35400" },
            { name: "Heavy Ordnance", cost: 500, range: 260, fireRate: 60, damage: 250, splashRadius: 150, color: "#b34700" },
            { name: "Nuclear Battery", cost: 1200, range: 400, fireRate: 50, damage: 800, splashRadius: 250, color: "#8a3100" }
        ]
    },
    sniper: {
        name: "Sniper",
        cost: 350,
        range: 400,
        fireRate: 150,
        damage: 120,
        color: "#95a5a6",
        upgrades: [
            { name: "Marksman", cost: 300, range: 500, fireRate: 120, damage: 350, color: "#7f8c8d" },
            { name: "Anti-Tank Rifle", cost: 700, range: 650, fireRate: 100, damage: 1200, color: "#2c3e50" },
            { name: "Orbit Hammer", cost: 2000, range: 1000, fireRate: 150, damage: 8000, color: "#000000" }
        ]
    },
    tesla: {
        name: "Tesla",
        cost: 450,
        range: 180,
        fireRate: 15,
        damage: 10,
        color: "#f1c40f",
        upgrades: [
            { name: "Voltage Spike", cost: 400, range: 220, fireRate: 12, damage: 25, color: "#f39c12" },
            { name: "Chain Lightning", cost: 900, range: 280, fireRate: 10, damage: 80, color: "#e67e22" },
            { name: "Lightning Storm", cost: 2500, range: 400, fireRate: 4, damage: 250, color: "#d35400" }
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
    const scale = Math.floor((waveNum - 10) / 2) + 1; // Faster scaling
    const hpMultiplier = 1 + (waveNum - 10) * 0.15; // 15% more HP per wave after 10
    const zombies = [
        {type: 'normal', count: 10 + Math.floor(scale * 1.5)},
        {type: 'fast', count: 5 + Math.floor(scale * 1.2)},
        {type: 'tank', count: 2 + Math.floor(scale * 0.8)},
        {type: 'crawler', count: 4 + scale}
    ];
    if (waveNum % 5 === 0) {
        zombies.push({type: 'boss', count: Math.floor(waveNum / 10)});
    }
    return { zombies, hpMultiplier };
}

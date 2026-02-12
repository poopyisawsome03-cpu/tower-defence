class GameMap {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.path = [];
        this.decorations = [];
        this.generatePath();
        this.generateDecorations();
    }

    generatePath() {
        // Paths are arrays of {x, y} coordinates
        if (this.difficulty === 0) { // Easy: Garden path
            this.path = [
                {x: 0, y: 300},
                {x: 200, y: 300},
                {x: 200, y: 100},
                {x: 600, y: 100},
                {x: 600, y: 500},
                {x: 800, y: 500}
            ];
            this.name = "Garden Path";
            this.bgColor = "#4a7c23"; // Grass
            this.pathColor = "#8b7355";
            this.pathBorder = "#6b5344";
        } else if (this.difficulty === 1) { // Medium: City streets
            this.path = [
                {x: 400, y: 0},
                {x: 400, y: 100},
                {x: 100, y: 100},
                {x: 100, y: 500},
                {x: 700, y: 500},
                {x: 700, y: 300},
                {x: 800, y: 300}
            ];
            this.name = "City Streets";
            this.bgColor = "#5d6d7e"; // Concrete
            this.pathColor = "#2c3e50";
            this.pathBorder = "#1a252f";
        } else { // Hard: Graveyard
            this.path = [
                {x: 0, y: 100},
                {x: 700, y: 100},
                {x: 700, y: 200},
                {x: 100, y: 200},
                {x: 100, y: 400},
                {x: 700, y: 400},
                {x: 700, y: 550},
                {x: 800, y: 550}
            ];
            this.name = "Graveyard";
            this.bgColor = "#1a252f"; // Dark
            this.pathColor = "#4a5568";
            this.pathBorder = "#2d3748";
        }
    }

    generateDecorations() {
        this.decorations = [];
        const count = 15 + this.difficulty * 5;
        
        for (let i = 0; i < count; i++) {
            let x, y;
            let attempts = 0;
            do {
                x = Math.random() * CANVAS_WIDTH;
                y = Math.random() * CANVAS_HEIGHT;
                attempts++;
            } while (this.isNearPath(x, y) && attempts < 20);
            
            if (attempts < 20) {
                this.decorations.push({
                    x, y,
                    type: this.getDecorationType(),
                    size: 10 + Math.random() * 15,
                    rotation: Math.random() * Math.PI * 2
                });
            }
        }
    }

    getDecorationType() {
        if (this.difficulty === 0) {
            return ['tree', 'flower', 'bush'][Math.floor(Math.random() * 3)];
        } else if (this.difficulty === 1) {
            return ['car', 'barrier', 'debris'][Math.floor(Math.random() * 3)];
        } else {
            return ['gravestone', 'bone', 'skull'][Math.floor(Math.random() * 3)];
        }
    }

    draw(ctx) {
        // Draw background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw background pattern based on difficulty
        this.drawBackgroundPattern(ctx);

        // Draw path border
        ctx.strokeStyle = this.pathBorder;
        ctx.lineWidth = TILE_SIZE + 8;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.stroke();

        // Draw main path
        ctx.strokeStyle = this.pathColor;
        ctx.lineWidth = TILE_SIZE;
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.stroke();

        // Draw path details
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 20]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw decorations
        this.decorations.forEach(d => this.drawDecoration(ctx, d));

        // Draw entry/exit points
        this.drawEntryExit(ctx);
    }

    drawBackgroundPattern(ctx) {
        if (this.difficulty === 0) {
            // Grass texture
            ctx.fillStyle = "rgba(0,0,0,0.05)";
            for (let i = 0; i < 100; i++) {
                ctx.fillRect(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 2, 8);
            }
        } else if (this.difficulty === 1) {
            // Building silhouettes in background
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            for (let x = 0; x < CANVAS_WIDTH; x += 80) {
                const h = 50 + Math.random() * 100;
                ctx.fillRect(x, CANVAS_HEIGHT - h, 60, h);
            }
        } else {
            // Fog effect
            const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
            gradient.addColorStop(0, "rgba(100, 100, 120, 0.1)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

    drawDecoration(ctx, d) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);

        if (d.type === 'tree') {
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(-3, 0, 6, d.size);
            ctx.fillStyle = "#2e7d32";
            ctx.beginPath();
            ctx.arc(0, -d.size * 0.3, d.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        } else if (d.type === 'flower') {
            ctx.fillStyle = "#8bc34a";
            ctx.fillRect(-1, 0, 2, d.size * 0.5);
            ctx.fillStyle = ["#e91e63", "#9c27b0", "#ffeb3b"][Math.floor(Math.random() * 3)];
            ctx.beginPath();
            ctx.arc(0, -d.size * 0.2, d.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (d.type === 'bush') {
            ctx.fillStyle = "#388e3c";
            ctx.beginPath();
            ctx.arc(0, 0, d.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (d.type === 'gravestone') {
            ctx.fillStyle = "#607d8b";
            ctx.beginPath();
            ctx.moveTo(-d.size * 0.4, d.size * 0.3);
            ctx.lineTo(-d.size * 0.4, -d.size * 0.3);
            ctx.quadraticCurveTo(0, -d.size * 0.7, d.size * 0.4, -d.size * 0.3);
            ctx.lineTo(d.size * 0.4, d.size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#455a64";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (d.type === 'bone') {
            ctx.fillStyle = "#eceff1";
            ctx.beginPath();
            ctx.ellipse(0, 0, d.size * 0.5, d.size * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (d.type === 'skull') {
            ctx.fillStyle = "#eceff1";
            ctx.beginPath();
            ctx.arc(0, 0, d.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1a252f";
            ctx.beginPath();
            ctx.arc(-d.size * 0.15, -d.size * 0.1, d.size * 0.1, 0, Math.PI * 2);
            ctx.arc(d.size * 0.15, -d.size * 0.1, d.size * 0.1, 0, Math.PI * 2);
            ctx.fill();
        } else if (d.type === 'car') {
            ctx.fillStyle = "#b71c1c";
            ctx.fillRect(-d.size * 0.6, -d.size * 0.3, d.size * 1.2, d.size * 0.5);
            ctx.fillStyle = "#212121";
            ctx.beginPath();
            ctx.arc(-d.size * 0.3, d.size * 0.2, d.size * 0.15, 0, Math.PI * 2);
            ctx.arc(d.size * 0.3, d.size * 0.2, d.size * 0.15, 0, Math.PI * 2);
            ctx.fill();
        } else if (d.type === 'barrier') {
            ctx.fillStyle = "#ff9800";
            ctx.fillRect(-d.size * 0.4, -d.size * 0.2, d.size * 0.8, d.size * 0.4);
            ctx.fillStyle = "#212121";
            ctx.fillRect(-d.size * 0.4, -d.size * 0.1, d.size * 0.25, d.size * 0.2);
            ctx.fillRect(d.size * 0.15, -d.size * 0.1, d.size * 0.25, d.size * 0.2);
        } else if (d.type === 'debris') {
            ctx.fillStyle = "#757575";
            ctx.beginPath();
            ctx.moveTo(-d.size * 0.3, d.size * 0.2);
            ctx.lineTo(0, -d.size * 0.3);
            ctx.lineTo(d.size * 0.3, d.size * 0.2);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    drawEntryExit(ctx) {
        // Entry point (green arrow)
        const start = this.path[0];
        ctx.fillStyle = "#2ecc71";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("▶ START", start.x + 50, start.y - 30);

        // Exit point (red X)
        const end = this.path[this.path.length - 1];
        ctx.fillStyle = "#e74c3c";
        ctx.fillText("🏠 EXIT", end.x - 50, end.y - 30);
    }

    // Check if a position is too close to the path
    isNearPath(x, y) {
        const threshold = TILE_SIZE / 1.5;
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i+1];
            const dist = this.distToSegment({x, y}, p1, p2);
            if (dist < threshold) return true;
        }
        return false;
    }

    distToSegment(p, v, w) {
        const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
        if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
    }
}

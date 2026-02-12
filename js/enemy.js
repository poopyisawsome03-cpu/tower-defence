class Enemy {
    constructor(type, path) {
        this.type = type;
        const stats = ZOMBIE_TYPES[type];
        this.name = stats.name;
        this.maxHealth = stats.health;
        this.health = stats.health;
        this.speed = stats.speed;
        this.baseSpeed = stats.speed;
        this.color = stats.color;
        this.skinColor = stats.skinColor || stats.color;
        this.reward = stats.reward;
        
        this.path = path;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        
        // Size based on type
        if (type === 'boss') {
            this.radius = 30;
        } else if (type === 'tank') {
            this.radius = 22;
        } else if (type === 'crawler') {
            this.radius = 10;
        } else {
            this.radius = 15;
        }
        
        this.isDead = false;
        this.finished = false;
        this.slowTimer = 0;
        this.angle = 0; // Direction facing
        this.animFrame = 0;
    }

    update() {
        if (this.isDead || this.finished) return;

        // Handle slowing
        if (this.slowTimer > 0) {
            this.slowTimer--;
        } else {
            this.speed = this.baseSpeed;
        }

        const target = this.path[this.pathIndex + 1];
        if (!target) {
            this.finished = true;
            return;
        }

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Track facing direction
        this.angle = Math.atan2(dy, dx);
        this.animFrame += this.speed * 0.1;

        if (dist < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.pathIndex++;
            if (this.pathIndex >= this.path.length - 1) {
                this.finished = true;
            }
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw(ctx) {
        if (this.isDead || this.finished) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI/2);

        const r = this.radius;
        const wobble = Math.sin(this.animFrame) * 2;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'crawler') {
            // Crawler - low to ground
            ctx.fillStyle = this.skinColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.2, r * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Arms reaching forward
            ctx.strokeStyle = this.skinColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-r * 0.8, -r * 0.3);
            ctx.lineTo(-r * 1.5 + wobble, -r);
            ctx.moveTo(r * 0.8, -r * 0.3);
            ctx.lineTo(r * 1.5 - wobble, -r);
            ctx.stroke();
        } else if (this.type === 'boss') {
            // Boss zombie - crowned and big
            // Body
            ctx.fillStyle = this.skinColor;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            // Tattered clothing
            ctx.fillStyle = "#4a0000";
            ctx.beginPath();
            ctx.arc(0, r * 0.3, r * 0.8, 0, Math.PI);
            ctx.fill();
            // Crown
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.7);
            ctx.lineTo(-r * 0.4, -r * 1.3);
            ctx.lineTo(-r * 0.2, -r * 0.9);
            ctx.lineTo(0, -r * 1.4);
            ctx.lineTo(r * 0.2, -r * 0.9);
            ctx.lineTo(r * 0.4, -r * 1.3);
            ctx.lineTo(r * 0.6, -r * 0.7);
            ctx.closePath();
            ctx.fill();
            // Arms
            ctx.strokeStyle = this.skinColor;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(-r * 0.8, 0);
            ctx.lineTo(-r * 1.3 + wobble, r * 0.5);
            ctx.moveTo(r * 0.8, 0);
            ctx.lineTo(r * 1.3 - wobble, r * 0.5);
            ctx.stroke();
        } else {
            // Normal, fast, tank zombies
            // Body (torso)
            ctx.fillStyle = this.type === 'tank' ? "#3d4f3d" : "#4a5568";
            ctx.beginPath();
            ctx.ellipse(0, r * 0.3, r * 0.7, r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = this.skinColor;
            ctx.beginPath();
            ctx.arc(0, -r * 0.2, r * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Zombie arms
            ctx.strokeStyle = this.skinColor;
            ctx.lineWidth = this.type === 'tank' ? 6 : 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            // Left arm reaching forward
            ctx.moveTo(-r * 0.6, r * 0.1);
            ctx.lineTo(-r * 0.9 + wobble * 0.5, -r * 0.5);
            // Right arm reaching forward
            ctx.moveTo(r * 0.6, r * 0.1);
            ctx.lineTo(r * 0.9 - wobble * 0.5, -r * 0.5);
            ctx.stroke();

            // Zombie hair/decay marks
            if (this.type === 'tank') {
                ctx.fillStyle = "#2d3a2d";
                ctx.beginPath();
                ctx.arc(-r * 0.3, -r * 0.5, r * 0.2, 0, Math.PI * 2);
                ctx.arc(r * 0.2, -r * 0.4, r * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Eyes (glowing red for all)
        ctx.fillStyle = "#ff0000";
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#ff0000";
        const eyeSize = this.type === 'boss' ? 5 : (this.type === 'crawler' ? 2 : 3);
        const eyeY = this.type === 'crawler' ? -2 : -this.radius * 0.3;
        ctx.beginPath();
        ctx.arc(-this.radius * 0.25, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.radius * 0.25, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Slow effect indicator
        if (this.slowTimer > 0) {
            ctx.strokeStyle = "#00d2ff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            // Ice crystals
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + this.animFrame;
                ctx.fillStyle = "#b0e0e6";
                ctx.beginPath();
                ctx.moveTo(
                    this.x + Math.cos(angle) * (this.radius + 6),
                    this.y + Math.sin(angle) * (this.radius + 6)
                );
                ctx.lineTo(
                    this.x + Math.cos(angle + 0.2) * (this.radius + 12),
                    this.y + Math.sin(angle + 0.2) * (this.radius + 12)
                );
                ctx.lineTo(
                    this.x + Math.cos(angle - 0.2) * (this.radius + 12),
                    this.y + Math.sin(angle - 0.2) * (this.radius + 12)
                );
                ctx.closePath();
                ctx.fill();
            }
        }

        // Health bar
        const barWidth = this.radius * 2;
        const barHeight = 5;
        const barY = this.y - this.radius - 12;
        ctx.fillStyle = "#333";
        ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? "#2ecc71" : (healthPercent > 0.25 ? "#f39c12" : "#e74c3c");
        ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isDead = true;
        }
    }

    applySlow(amount, duration) {
        this.speed = this.baseSpeed * amount;
        this.slowTimer = duration;
    }
}

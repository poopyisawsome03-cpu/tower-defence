class Projectile {
    constructor(x, y, target, damage, options) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.target = target;
        this.damage = damage;
        this.speed = 7;
        this.radius = 4;
        this.color = options.color || "yellow";
        this.slowAmount = options.slowAmount || 0;
        this.splashRadius = options.splashRadius || 0;
        this.isDead = false;
        this.angle = Math.atan2(target.y - y, target.x - x);
        this.trail = [];
    }

    update(enemies) {
        if (this.isDead) return;

        // Store trail positions
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 8) this.trail.shift();

        // Move towards target (or target's last position if dead)
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        if (dist < this.speed) {
            this.hit(enemies);
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    hit(enemies) {
        this.isDead = true;
        
        if (this.splashRadius > 0) {
            // Area of effect damage
            for (const enemy of enemies) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= this.splashRadius) {
                    this.applyDamage(enemy);
                }
            }
        } else {
            // Single target damage
            if (!this.target.isDead) {
                this.applyDamage(this.target);
            }
        }
    }

    applyDamage(enemy) {
        enemy.takeDamage(this.damage);
        if (this.slowAmount > 0) {
            enemy.applySlow(this.slowAmount, 120); // 2 seconds slow (60fps)
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.5;
            const size = (i / this.trail.length) * this.radius;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Draw projectile based on type
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.splashRadius > 0) {
            // Missile/rocket
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.moveTo(this.radius * 2, 0);
            ctx.lineTo(-this.radius, -this.radius);
            ctx.lineTo(-this.radius * 0.5, 0);
            ctx.lineTo(-this.radius, this.radius);
            ctx.closePath();
            ctx.fill();
            // Flame trail
            ctx.fillStyle = "#f39c12";
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.5, 0);
            ctx.lineTo(-this.radius * 2, -3);
            ctx.lineTo(-this.radius * 2.5, 0);
            ctx.lineTo(-this.radius * 2, 3);
            ctx.closePath();
            ctx.fill();
        } else if (this.slowAmount > 0) {
            // Ice shard
            ctx.fillStyle = "#00d2ff";
            ctx.beginPath();
            ctx.moveTo(this.radius * 2, 0);
            ctx.lineTo(0, -this.radius);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(0, this.radius);
            ctx.closePath();
            ctx.fill();
            // Inner glow
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Bullet
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.5, this.radius, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
}

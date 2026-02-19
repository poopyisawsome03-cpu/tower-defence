class Tower {
    constructor(type, x, y) {
        this.typeId = type;
        const stats = TOWER_TYPES[type];
        this.name = stats.name;
        this.x = x;
        this.y = y;
        this.level = 0;
        
        this.applyStats(stats);
        
        this.radius = 20;
        this.fireTimer = 0;
        this.target = null;
        this.angle = 0; // Turret rotation
        this.totalInvested = stats.cost;
    }

    applyStats(stats) {
        this.name = stats.name;
        this.range = stats.range;
        this.fireRate = stats.fireRate;
        this.damage = stats.damage;
        this.color = stats.color;
        // Ensure properties are reset if not present in the upgrade
        this.slowAmount = stats.slowAmount || 0;
        this.splashRadius = stats.splashRadius || 0;
        
        // Fix projectile color defaults
        const baseType = TOWER_TYPES[this.typeId];
        this.projectileColor = stats.projectileColor || baseType.projectileColor || stats.color;
    }

    upgrade() {
        const potentialUpgrades = TOWER_TYPES[this.typeId].upgrades;
        if (potentialUpgrades && this.level < potentialUpgrades.length) {
            const nextStats = potentialUpgrades[this.level];
            this.totalInvested += nextStats.cost;
            this.applyStats(nextStats);
            this.level++;
            return true;
        }
        return false;
    }

    getUpgradeCost() {
        const potentialUpgrades = TOWER_TYPES[this.typeId].upgrades;
        if (potentialUpgrades && this.level < potentialUpgrades.length) {
            return potentialUpgrades[this.level].cost;
        }
        return null;
    }

    update(enemies, projectiles) {
        if (this.fireTimer > 0) this.fireTimer--;

        // Find target if none or out of range
        if (!this.target || this.target.isDead || this.target.finished || this.distTo(this.target) > this.range) {
            this.target = this.findTarget(enemies);
        }

        // Track target with turret
        if (this.typeId === 'tesla') {
            this.angle += 0.05; // Spin forever
        } else if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.angle = Math.atan2(dy, dx);
        }

        if (this.target && this.fireTimer <= 0) {
            this.shoot(projectiles);
            this.fireTimer = this.fireRate;
        }
    }

    findTarget(enemies) {
        let nearest = null;
        let minDist = this.range;

        for (const enemy of enemies) {
            const d = this.distTo(enemy);
            if (d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        }
        return nearest;
    }

    distTo(obj) {
        return Math.sqrt(Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2));
    }

    shoot(projectiles) {
        projectiles.push(new Projectile(
            this.x, this.y, 
            this.target, 
            this.damage, 
            {
                color: this.projectileColor,
                slowAmount: this.slowAmount,
                splashRadius: this.splashRadius
            }
        ));
    }

    draw(ctx, isSelected) {
        // Draw range circle if selected
        if (isSelected) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const r = this.radius;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 3, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw tower base (platform)
        ctx.fillStyle = "#34495e";
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw type-specific turret
        const baseOrientationOffset = this.typeId === 'tesla' ? -Math.PI / 2 : 0;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + baseOrientationOffset); // Rotate toward target

        if (this.typeId === 'basic') {
            // Sentry turret - gun barrel
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
            ctx.fill();
            // Barrel
            ctx.fillStyle = "#1a252f";
            ctx.fillRect(r * 0.3, -3, r * 0.8, 6);
            // Barrel tip glow
            ctx.fillStyle = this.level > 0 ? "#ff6b6b" : "#555";
            ctx.beginPath();
            ctx.arc(r * 1.1, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.typeId === 'slow') {
            // Frost tower - crystal/emitter
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Ice crystals
            ctx.fillStyle = "#e0ffff";
            for (let i = 0; i < 6; i++) {
                ctx.save();
                ctx.rotate((i / 6) * Math.PI * 2);
                ctx.beginPath();
                ctx.moveTo(r * 0.4, 0);
                ctx.lineTo(r * 0.7, -4);
                ctx.lineTo(r * 0.9, 0);
                ctx.lineTo(r * 0.7, 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            // Center glow
            ctx.fillStyle = "rgba(0, 210, 255, 0.6)";
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.typeId === 'area') {
            // Bomber - missile launcher
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
            ctx.fill();
            // Missile tubes
            ctx.fillStyle = "#1a252f";
            ctx.fillRect(r * 0.2, -8, r * 0.6, 5);
            ctx.fillRect(r * 0.2, 3, r * 0.6, 5);
            // Red tips
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(r * 0.8, -5.5, 3, 0, Math.PI * 2);
            ctx.arc(r * 0.8, 5.5, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.typeId === 'sniper') {
            // Sniper - long thin barrel
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
            // Long Barrel
            ctx.fillStyle = "#333";
            ctx.fillRect(r * 0.2, -3, r * 1.5, 6);
            // Scope
            ctx.fillStyle = "#111";
            ctx.fillRect(r * 0.3, -6, r * 0.6, 3);
            // Muzzle flash spot
            ctx.fillStyle = "rgba(149, 165, 166, 0.3)";
            ctx.beginPath();
            ctx.arc(r * 1.7, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.typeId === 'tesla') {
            // Tesla - energy coils
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
            ctx.fill();
            // Coils
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, r * (0.3 + i * 0.2), 0, Math.PI * 2);
                ctx.stroke();
            }
            // Lightning rod
            ctx.fillStyle = "#fff";
            ctx.fillRect(-2, -r * 1.2, 4, r * 1.2);
            // Top orb
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.arc(0, -r * 1.2, 5, 0, Math.PI * 2);
            ctx.fill();
            // Glow
            const pulse = (Math.sin(Date.now() / 100) + 1) * 0.5;
            ctx.shadowBlur = 10 * pulse;
            ctx.shadowColor = "#00ffff";
        }

        ctx.restore();
        ctx.shadowBlur = 0; // Reset shadow

        // Level indicators (stars)
        for (let i = 0; i < this.level; i++) {
            const starX = this.x - 10 + (i * 10);
            const starY = this.y + r + 8;
            ctx.fillStyle = "#f1c40f";
            ctx.beginPath();
            this.drawStar(ctx, starX, starY, 5, 5, 2.5);
            ctx.fill();
        }

        // Selection highlight
        if (isSelected) {
            ctx.strokeStyle = "#f1c40f";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }
}

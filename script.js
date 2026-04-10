let audioCtx;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width, height, orbs = [], score = 0, active = false;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function initAudio() { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

// Cozy Warm Chime
function playWarmNote(freq) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle'; // Warmer, more lo-fi sound
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 3);
}

class AuraOrb {
    constructor() {
        this.size = 150 + Math.random() * 150; // Huge orbs
        this.x = Math.random() * width;
        this.y = height + this.size;
        this.speed = 0.3 + Math.random() * 0.7;
        this.color = Math.random() > 0.5 ? '#c084fc' : '#818cf8'; // Soft purple/blue
        this.wobble = Math.random() * Math.PI * 2;
    }

    update() {
        this.y -= this.speed;
        this.wobble += 0.01;
        this.x += Math.sin(this.wobble) * 0.5; // Natural floating movement
        return this.y > -this.size;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // Makes them glow when overlapping
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function startAura() {
    initAudio();
    document.getElementById('boot-wrapper').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('boot-wrapper').style.display = 'none';
        active = true;
        loop();
    }, 600);
}

function loop() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);

    if (Math.random() < 0.015) orbs.push(new AuraOrb());

    orbs = orbs.filter(orb => {
        const stillAlive = orb.update();
        orb.draw();
        return stillAlive;
    });

    requestAnimationFrame(loop);
}

window.addEventListener('mousedown', (e) => {
    orbs.forEach((orb, i) => {
        const d = Math.hypot(e.clientX - orb.x, e.clientY - orb.y);
        if (d < orb.size / 2) {
            orbs.splice(i, 1);
            score++;
            document.getElementById('score').textContent = score.toString().padStart(2, '0');
            
            // F Major Pentatonic Scale (Very cozy)
            const notes = [174.61, 196.00, 220.00, 261.63, 293.66];
            playWarmNote(notes[Math.floor(Math.random() * notes.length)]);
        }
    });
});
import smokeImg from "assets/images/smoke.png";
import * as PIXI from 'pixi.js';

const ParticleContainer = PIXI.particles.ParticleContainer;
const Sprite = PIXI.Sprite;

let fogParticles = [];
let factor = 10;

function generateRandom(min, max) {
    return Math.random() * (max - min) + min;
}

export {smokeImg};

export function createFog(smokeTexture, canvasWidth, canvasHeight, app) {
    let fog = new ParticleContainer();
    let particlesNumber = 80;
    let minVelocity = -1;
    let maxVelocity = 1;
    let smoke;

    for (let i = 0; i < particlesNumber; i++) {
        let vx = generateRandom(minVelocity, maxVelocity);
        let vy = generateRandom(minVelocity, maxVelocity);
        let pos = "";

        smoke = new Sprite(smokeTexture);
        smoke.scale.set(0.5);
        smoke.anchor.x = 0.5;
        smoke.anchor.y = 0.5;

        if (i < particlesNumber/4) {
            smoke.position.set(generateRandom(0, canvasWidth/factor), generateRandom(0, canvasHeight));
            pos = "left";
        } else if (i < particlesNumber/2) {
            smoke.position.set(generateRandom(9*canvasWidth/factor, canvasWidth), generateRandom(0, canvasHeight));
            pos = "right";
        } else if (i < 3* particlesNumber/4) {
            smoke.position.set(generateRandom(0, canvasWidth), generateRandom(0, canvasHeight/factor));
            pos = "top";
        } else {
            smoke.position.set(generateRandom(0, canvasWidth), generateRandom(9*canvasHeight/factor, canvasHeight));
            pos = "bottom";
        }

        let particle = {smoke, vx, vy, pos};
        fogParticles.push(particle);

        fog.addChild(smoke);
    }

    app.stage.addChild(fog);
}

export function moveFog(canvasWidth, canvasHeight) {
    fogParticles.forEach(particle => {

        particle.smoke.x += particle.vx;
        particle.smoke.y += particle.vy;

        switch(particle.pos){
            case "right":
                if (particle.smoke.x <= 9*canvasWidth/factor) {
                    particle.vx = -particle.vx;
                    particle.smoke.x = 9*canvasWidth/factor;
                }
                break;
            case "left":
                if (particle.smoke.x >= canvasWidth/factor) {
                    particle.vx = -particle.vx;
                    particle.smoke.x = canvasWidth/factor;
                }
                break;
            case "top":
                if (particle.smoke.y >= canvasHeight/factor) {
                    particle.vy = -particle.vy;
                    particle.smoke.y = canvasHeight/factor;
                }
                break;
            case "bottom":
                if (particle.smoke.y <= 9*canvasHeight/factor) {
                    particle.vy = -particle.vy;
                    particle.smoke.y = 9*canvasHeight/factor;
                }
                break;
        }

        if (particle.smoke.x >= canvasWidth) {
            particle.vx = -particle.vx;
            particle.smoke.x = canvasWidth;
        }
        else if (particle.smoke.x <= 0) {
            particle.vx = -particle.vx;
            particle.smoke.x = 0;
        }

        if (particle.smoke.y >= canvasHeight) {
            particle.vy = -particle.vy;
            particle.smoke.y = canvasHeight;
        }
        else if (particle.smoke.y <= 0) {
            particle.vy = -particle.vy;
            particle.smoke.y = 0;
        }
    })
}

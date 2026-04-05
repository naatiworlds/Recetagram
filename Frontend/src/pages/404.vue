<template>
    <main id="main404">
        <div id="juego404">
            <h1>Error al encontrar la página</h1>
            <div id="gameArea" @mousemove="handleMouseMove" @click="handleClick">
                <div id="eye1" class="eye" ref="eye1">
                    <div class="pupil" ref="pupil1"></div>
                </div>
                <div id="eye2" class="eye" ref="eye2">
                    <div class="pupil" ref="pupil2"></div>
                </div>
                <div id="target" ref="target"></div>
                <div id="score">Score: {{ score }}</div>
            </div>
        </div>
    </main>
</template>

<script>
import Nav from '../components/Nav.vue';
import { preventOverlap, isHit } from '../utils/eymovement';
import { teleportEye } from '../utils/teleport';

export default {
    components: {
        Nav
    },
    data() {
        return {
            score: 0,
            eyeSpeed: 10,
            menuVisible: false,
        };
    },
    mounted() {
        this.score = 0;
    },
    methods: {
        handleMouseMove(event) {
            const gameArea = event.currentTarget;
            const mouseX = event.clientX - gameArea.offsetLeft;
            const mouseY = event.clientY - gameArea.offsetTop;

            this.moveEye(this.$refs.eye1, mouseX, mouseY, gameArea);
            this.moveEye(this.$refs.eye2, mouseX, mouseY, gameArea);
            preventOverlap(this.$refs.eye1, this.$refs.eye2, gameArea);

            if (isHit(mouseX, mouseY, this.$refs.eye1, gameArea) || isHit(mouseX, mouseY, this.$refs.eye2, gameArea)) {
                this.score -= 0.5;
            }
        },
        moveEye(eye, mouseX, mouseY, gameArea) {
            const rect = eye.getBoundingClientRect();
            const eyeX = rect.left + rect.width / 2 - gameArea.offsetLeft;
            const eyeY = rect.top + rect.height / 2 - gameArea.offsetTop;
            const angle = Math.atan2(mouseY - eyeY, mouseX - eyeX);

            const newLeft = eye.offsetLeft + Math.cos(angle) * this.eyeSpeed;
            const newTop = eye.offsetTop + Math.sin(angle) * this.eyeSpeed;

            eye.style.left = `${newLeft}px`;
            eye.style.top = `${newTop}px`;

        },
        handleClick(event) {
            const gameArea = event.currentTarget;
            const clickX = event.clientX - gameArea.offsetLeft;
            const clickY = event.clientY - gameArea.offsetTop;

            this.$refs.target.style.left = `${clickX - 5}px`;
            this.$refs.target.style.top = `${clickY - 5}px`;
            this.$refs.target.style.display = 'block';

            setTimeout(() => {
                this.$refs.target.style.display = 'none';
            }, 200);

            if (isHit(clickX, clickY, this.$refs.eye1, gameArea)) {
                this.score += 10;
                teleportEye(this.$refs.eye1, clickX, clickY, gameArea);
            }
            if (isHit(clickX, clickY, this.$refs.eye2, gameArea)) {
                this.score += 10;
                teleportEye(this.$refs.eye2, clickX, clickY, gameArea);
            }
        }
    }
};
</script>

<style scoped>
.oculto~#main404 {
    position: absolute;
    top: 9%;
    width: 95%;
    height: 85%;
    z-index: 1;
}

#main404 {
    grid-area: var(--main-area);
    margin: 3em 3em;
}

#juego404 {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background-color: var(--secundary-color);
    border-radius: 10px;
    padding: 20px;
    height: 95%;
    /* Ajusta la altura del contenedor principal */
}
#juego404 h1 {
    font-size: 24px;
    color: var(--text-color-important);
}

#gameArea {
    position: relative;
    width: 100%;
    /* Ajusta el ancho al 90% del viewport */
    height: 100%;
    /* Ajusta la altura al 90% del viewport */
    background-color: var(--sombra-color);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border-radius: 10px;
}

.eye {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: white;
    border-radius: 50%;
    border: 2px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pupil {
    width: 20px;
    height: 20px;
    background-color: black;
    border-radius: 50%;
}

#eye1 {
    top: 50px;
    left: 50px;
}

#eye2 {
    top: 50px;
    left: 150px;
}

#target {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: red;
    border-radius: 50%;
    display: none;
}

#score {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 24px;
    color: var(--text-color-important);

}
</style>

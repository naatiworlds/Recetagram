<template>
    <header id="header">
        <div id="icon-Container">
            <div class='wrap'>
                <input name="light-dark" type='checkbox'>
                <div class='griddle'></div>
                <div class='cake'></div>
                <div class='syrup'></div>
                <div class='butter'></div>
                <div class='butter two'></div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                            result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>
            <svg class="svg" viewBox="0 0 400 400">
                <defs>
                    <filter id="duotone-filter-post-one">
                        <feColorMatrix type="matrix"
                            values="0.14453125 0 0 0 0.33203125 0.71875 0 0 0 0.27734375 -0.34765625 0 0 0 0.73046875 0 0 0 1 0">
                        </feColorMatrix>
                    </filter>
                </defs>
            </svg>
            <div class="toggle-switch">
                <input type="checkbox" id="toggleSwitch" name="toggleSwitch">
                <label for="toggleSwitch" class="chef-hat">
                    <div class="hat-top">
                        <div class="half-circle left"></div>
                        <div class="half-circle middle"></div>
                        <div class="half-circle right"></div>
                    </div>
                    <div class="hat-body">
                        <div class="line line1"></div>
                        <div class="line line2"></div>
                        <div class="line line3"></div>
                        <div class="line line4"></div>
                        <div class="line line5"></div>
                    </div>
                    <div class="hat-brim"></div>
                </label>
            </div>
            <i class="fa-solid fa-bars fa-lg" id="toggleMenuButton"></i>

        </div>
        <h1><a href="/">Recetagram</a></h1>

        <div class="icon-group">

            <i class="fa-solid fa-bell fa-lg notificaciones"></i>
            <i class="fa-solid fa-message fa-lg mensaje"></i>
            <img :src="imagen" alt="Logo" width="50px">
            <!-- Contenido adicional -->
        </div>

    </header>
</template>

<script>
import logo from "../assets/descarga.png";
export default {
    data() {
        return {
            imagen: logo
        }
    },
}
</script>

<style lang="scss" scoped></style>
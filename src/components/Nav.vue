<template>
    <aside id="aside">
        <nav>
            <ul>
                <li><a href="index.html" class="nav-normal"><i class="fa-solid fa-house"></i> Inicio</a></li>
                <li class="nav-icon"><a href="index.html" class="nav-icon"><i class="fa-solid fa-house"></i></a>
                </li>

                <li><a href="./pages/explorar.html" class="nav-normal"><i class="fa-solid fa-magnifying-glass"></i>
                        Explorar</a>
                </li>
                <li class="nav-icon"><a href="./pages/explorar.html" class="nav-icon"><i
                            class="fa-solid fa-magnifying-glass"></i></a></li>

                <li><a href="#" class="nav-normal"><i class="fa-solid fa-upload"></i> Crear</a></li>
                <li class="nav-icon"><a href="#" class="nav-icon"><i class="fa-solid fa-upload"></i></a></li>

                <li><a href="./pages/sesion.html" class="nav-normal"><i class="fa-solid fa-user"></i> Perfil</a></li>
                <li class="nav-icon"><a href="./pages/sesion.html" class="nav-icon"><i class="fa-solid fa-user"></i></a>
                </li>

                <li id="mensajes"><a href="#"><i class="fa-solid fa-message mensajes"></i> Mensajes </a></li>

                <li id="theme">
                    <details>
                        <summary><i class="fa-solid fa-palette"></i> theme</summary>
                        <label id="switch-aqua">
                            Aqua
                            <input type="radio" name="tema" value="aqua">
                        </label>
                        <label id="switch-pink">
                            pink
                            <input type="radio" name="tema" value="pink">
                        </label>
                        <label id="switch-default">
                            Default
                            <input type="radio" name="tema" value="defaul" checked>
                        </label>
                    </details>
                </li>
                <footer>
                    <li id="redes">
                        <div>
                            <a href="https://www.instagram.com/recetagram.oficial/" target="_blank"><i
                                    class="fa-brands fa-square-instagram fa-2xl"></i></a>
                            <a href="https://github.com/naatii/diw-UT4-Recetagram" target="_blank"><i
                                    class="fa-brands fa-square-github fa-2xl"></i></a>
                            <a href="#" target="_blank"><i class="fa-brands fa-linkedin fa-2xl"></i></a>
                        </div>
                    </li>
                    <li id="links">
                        <div>
                            <a href="#">Información</a>
                            <a href="./pages/contacto.html">Contacto</a>
                            <a href="#">Privacidad</a>
                            <a href="./pages/Terminos.html">Condiciones</a>
                            <a href="#">Idioma</a>
                        </div>
                    </li>
                    <li id="copy">
                        <div>
                            <a>&copy; 2024 Recetagram - Comparte tu cocina</a>
                        </div>
                    </li>
                </footer>
            </ul>
        </nav>
    </aside>
</template>

<script>
export default {

}
</script>

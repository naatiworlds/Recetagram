<template>
    <section>
        <main>
            <!-- Inputs para agregar ingredientes -->
            <div class="inputs-container">
                <div class="input-line">
                    <label>Nombre:</label>
                    <input v-model="newIngredient.name" type="text" placeholder="Ej: Harina" />
                </div>

                <div class="input-row">
                    <div class="input-group small">
                        <label>Cantidad:</label>
                        <input v-model="newIngredient.amount" type="number" min="0" placeholder="Ej: 2" />
                    </div>
                    <div class="input-group small">
                        <label>Unidad:</label>
                        <select v-model="newIngredient.unit" class="unit-select">
                            <option disabled value="">Selecciona</option>
                            <option>taza</option>
                            <option>cucharadita</option>
                            <option>gramos</option>
                            <option>mililitros</option>
                        </select>
                    </div>
                    <button class="add-button" @click="addIngredient">+</button>
                </div>
            </div>

            <!-- Lista de ingredientes con scroll -->
            <div class="ingredients-list">
                <h4>📝 Ingredientes añadidos:</h4>
                <div class="scrollable-list">
                    <ul>
                        <li v-for="(ing, index) in ingredients" :key="index">
                            • {{ ing.amount }} {{ ing.unit }} de {{ ing.name }}
                            <div class="actions">
                                <button class="edit-button" @click="editIngredient(index)">✏️</button>
                                <button class="remove-button" @click="removeIngredient(index)">🗑️</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    </section>
</template>

<script>
export default {
    name: "IngredientInput",
    data() {
        return {
            newIngredient: {
                name: "",
                amount: "",
                unit: "",
            },
            ingredients: [],
            editingIndex: null, // Índice del ingrediente que se está editando
        };
    },
    methods: {
        addIngredient() {
            if (this.editingIndex !== null) {
                // Guardar cambios en el ingrediente editado
                this.ingredients[this.editingIndex] = { ...this.newIngredient };
                this.editingIndex = null; // Salir del modo de edición
            } else {
                // Agregar un nuevo ingrediente
                if (
                    this.newIngredient.name &&
                    this.newIngredient.amount &&
                    this.newIngredient.unit
                ) {
                    this.ingredients.push({ ...this.newIngredient });
                }
            }
            // Limpiar los inputs
            this.newIngredient = { name: "", amount: "", unit: "" };
            this.validateIngredients(); // Validar la lista después de agregar
        },
        editIngredient(index) {
            // Cargar los datos del ingrediente en los inputs
            const ingredient = this.ingredients[index];
            this.newIngredient = { ...ingredient };
            this.editingIndex = index; // Establecer el índice del ingrediente que se está editando
        },
        removeIngredient(index) {
            this.ingredients.splice(index, 1);
            // Si se está editando el ingrediente eliminado, salir del modo de edición
            if (this.editingIndex === index) {
                this.editingIndex = null;
                this.newIngredient = { name: "", amount: "", unit: "" };
            }
            this.validateIngredients(); // Validar la lista después de eliminar
        },
        validateIngredients() {
            // Emitir un evento al componente padre indicando si la lista está vacía
            const isValid = this.ingredients.length > 0;
            this.$emit("validate-ingredients", isValid);
        },
    },
    mounted() {
        // Validar la lista al cargar el componente
        this.validateIngredients();
    },
};
</script>

<style scoped>
section {
    background-color: var(--secundary-color);
    border-radius: 10px;
    max-width: 700px;
    height: auto;
    margin: auto;
    padding: 1em;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header {
    background-color: var(--primary-color);
    border-radius: 10px 10px 0 0;
    padding: 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h2 {
    margin: 0;
    color: var(--text-color-important);
}

.close-button {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--text-color-important);
    cursor: pointer;
}

main {
    padding: 1em;
}

.input-line,
.input-row {
    display: flex;
    align-items: center;
    /* Alinear verticalmente los elementos */
    gap: 1em;
    margin-bottom: 1em;
}

.input-line input,
.input-group input,
.unit-select {
    padding: 10px;
    font-size: 14px;
    border: 1px solid var(--sombra-color);
    border-radius: 6px;
    width: 100%;
}

.input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.add-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 24px;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    /* Centrar el contenido horizontalmente */
    align-items: center;
    /* Centrar el contenido verticalmente */
    margin-top: auto;
    /* Asegurar que el botón esté alineado con los inputs */
}

.inputs-container {
    margin-bottom: 20px;
    /* Espaciado entre inputs y lista */
}

.ingredients-list {
    margin-top: 1em;
}

.scrollable-list {
    max-height: 150px;
    /* Altura máxima de la lista */
    overflow-y: auto;
    /* Habilitar scroll vertical */
    padding-right: 10px;
    /* Espaciado para evitar que el scroll tape el contenido */
    border: 1px solid var(--sombra-color);
    /* Opcional: para delimitar la lista */
    border-radius: 6px;
    /* Opcional: bordes redondeados */
    background-color: #f9f9f9;
    /* Fondo claro para diferenciar la lista */
}

.scrollable-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.ingredients-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f2f2f2;
    margin-bottom: 0.5em;
    padding: 0.5em 1em;
    border-radius: 6px;
}

.actions {
    display: flex;
    gap: 0.5em;
}

.edit-button,
.remove-button {
    background-color: var(--contrast-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 4px 8px;
    cursor: pointer;
}

.prev-button,
.submit-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}

.submit-button {
    background-color: var(--contrast-color);
}

.prev-button:hover,
.submit-button:hover,
.add-button:hover,
.remove-button:hover {
    opacity: 0.9;
}

@media (max-width: 600px) {
    section{
        width: 100%;
        padding: 0;
    }
    main {
        padding: 0;
        margin: 0;
    }
    .scrollable-list {
        max-height: 100px;
        /* Aumentar la altura máxima en pantallas pequeñas */
    }

}
</style>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <section class="crear-post-container">
      <header>
        <h2>{{ postToEdit ? "Editar post" : "Subir un nuevo post" }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </header>

      <main class="form-container">
        <!-- Vista previa de la imagen -->
        <div class="image-preview" v-if="imagePreviewUrl">
          <img :src="imagePreviewUrl" alt="Vista previa de la imagen" />
        </div>

        <form @submit.prevent="handleSubmit" id="form">
          <!-- Paso 1: Seleccionar imagen -->
          <div v-if="currentStep === 1" class="step">
            <h3>Paso 1: Selecciona una imagen</h3>
            <div class="file-upload">
              <label for="file-input" class="upload-button">
                Seleccionar archivo
                <input id="file-input" type="file" @change="handleFileChange" accept="image/*" style="display: none"
                  class="wide-input" />
              </label>
              <p v-if="selectedFileName" class="file-name">
                {{ selectedFileName }}
              </p>
              <span v-if="errors.image" class="error">
                <i class="fa fa-warning"></i> {{ errors.image }}
              </span>
            </div>
          </div>

          <!-- Paso 2: Título y descripción -->
          <div v-if="currentStep === 2" class="step">
            <h3>Paso 2: Título y descripción</h3>
            <label>
              Título
              <input type="text" v-model="post.title" placeholder="Título del post" @blur="validateTitle" />
              <span v-if="errors.title" class="error">
                <i class="fa fa-warning"></i> {{ errors.title }}
              </span>
            </label>

            <!-- Campo de descripción con markdown en vivo -->
            <label>
              Descripción
              <div class="markdown-input">
                <div ref="editable" contenteditable="true" @input="onMarkdownInput" @keydown="onKeydown"
                  @focus="onEditorFocus" @blur="validateDescription" :data-placeholder="'Descripción del post...'"
                  class="editor"></div>
              </div>

              <span v-if="errors.content" class="error">
                <i class="fa fa-warning"></i> {{ errors.content }}
              </span>
              <span class="counter">
                {{ post.description.length }} /
                {{ maxDescriptionLength }} caracteres
              </span>
            </label>
          </div>

          <!-- Paso 3: Ingredientes -->
          <div v-if="currentStep === 3" class="step">
            <h3>Paso 3: Ingredientes</h3>
            <div class="ingredients-container">
              <div class="ingredients-list">
                <IngredientInput v-model:ingredients="post.ingredients"
                  @validate-ingredients="handleIngredientValidation" />
              </div>

              <span v-if="errors.ingredients" class="error">
                <i class="fa fa-warning"></i> {{ errors.ingredients }}
              </span>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="navegation-buttons">
            <button type="button" v-if="currentStep > 1" @click="prevStep" class="prev-button">
              ⏪ Anterior
            </button>
            <button type="button" v-if="currentStep < 3" @click="nextStep" class="next-button">
              Siguiente
            </button>
          </div>

          <button type="submit" v-if="currentStep === 3" class="submit-button" :disabled="loading || !validateForm()">
            {{ postToEdit ? "Guardar cambios" : "Subir post" }}
          </button>
        </form>
      </main>
    </section>
  </div>
</template>

<script>
import { useNotificationStore } from "../stores/notification";
import { apiService } from "../services/api";
import IngredientInput from "../components/IngredientInput.vue";

export default {
  name: "Crear",
  components: {
    IngredientInput,
  },
  mounted() {
  // Crear mounted
  },
  props: {
    postToEdit: {
      type: [Object, Array],
      default: null,
    },
  },
  data() {
    return {
      notificationStore: useNotificationStore(),
      currentStep: 1,
      post: {
        title: "",
        description: "",
        image: null,
        is_private: false,
        ingredients: [{ name: "", quantity: "", unit: "" }],
      },
      imagePreviewUrl: "",
      loading: false,
      errors: {},
      selectedFileName: "",
      maxDescriptionLength: 2000,
      isIngredientListValid: false,
      isTypingUpdate: false,
    };
  },
  computed: {
    renderedMarkdown() {
      // render inline markdown (seguro escapando)
      return (
        this.parseMarkdown(this.post.description) ||
        '<span class="placeholder">Descripción del post...</span>'
      );
    },
  },
  watch: {
    postToEdit: {
      immediate: true,
      handler(newPost) {
  // Crear watcher postToEdit triggered
        if (newPost) {
          this.post.title = newPost.title || "";
          this.post.description = newPost.description || "";
          this.post.is_private = newPost.is_private || false;
          this.post.ingredients = this.parseIngredients(newPost.ingredients);

          if (newPost.imagen) {
            this.imagePreviewUrl = newPost.imagen; // muestra la URL
            this.post.image = null; // no pongas el URL aquí
          } else {
            this.imagePreviewUrl = "";
            this.post.image = null;
          }

          // Asegurar que estamos en el paso 2 (editor visible)
          if (this.currentStep !== 2) this.currentStep = 2;
          this.$nextTick(() => {
            // nextTick to render description
            this.renderDescriptionToEditor();
          });
        }
      },
    },
    currentStep(newVal) {
      if (newVal === 2) {
  // trying to render description for step 2
        this.$nextTick(() => this.renderDescriptionToEditor());
      }
    },
    "post.title"() {
      this.validateTitle();
    },
    "post.description"(newVal) {
      if (this.isTypingUpdate) return;
      // sincroniza el contenido del contenteditable si el cambio viene desde fuera
      this.$nextTick(() => {
        if (!this.$refs.editable) return;
        const currentPlain = this.$refs.editable.innerText || "";
        const desired = newVal || "";
  // description watcher sync
        if (currentPlain !== desired) {
          // applying formatToHtml
          this.$refs.editable.innerHTML = this.formatToHtml(desired);
          // after sync
        }
      });
      this.validateDescription();
    },
    "post.ingredients": {
      deep: true,
      handler() {
        this.validateIngredients();
      },
    },
  },
  methods: {
    // ----------------- MARKDOWN / INPUT EDITABLE -----------------
    onMarkdownInput() {
      if (!this.$refs.editable) return;
      const el = this.$refs.editable;

      // Normalizar desde texto plano del contenteditable (más confiable que innerHTML)
      // Primero garantizamos un token en caret si aún no existe
      if (!((el.textContent || '').includes('[[CARET]]'))) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0).cloneRange();
          range.collapse(false);
          range.insertNode(document.createTextNode('[[CARET]]'));
          // token inserted
        }
      }

      // Extraemos texto plano preservando listas y saltos de línea coherentes
      const plain = this.extractPlainText(el);
      let textWithToken = plain
        .replace(/\u00A0/g, ' ')     // nbsp -> espacio
        .replace(/\u200B/g, '')      // zero-width space
        .replace(/\r\n?/g, '\n');  // normalizar CRLF -> LF
  // onInput sample

      // Límite de longitud (sobre el texto con token)
      if (textWithToken.length > this.maxDescriptionLength) {
        textWithToken = textWithToken.slice(0, this.maxDescriptionLength);
      }

      // Texto real para el modelo sin token
      const text = textWithToken.replace('[[CARET]]', '');
  // onInput text length

      // Renderizado estilo WhatsApp con reglas solicitadas
      const formatInline = (s) => {
        return s
          // Monoespaciado entre tres backticks
          .replace(/```([^`\n]+)```/g, '<code class="mono">$1</code>')
          // Código inline entre un backtick
          .replace(/`([^`\n]+)`/g, '<code>$1</code>')
          // Negrita: *texto*
          .replace(/\*([^*\n]+)\*/g, '<span class="md-marker">*</span><b>$1<\/b><span class="md-marker">*</span>')
          // Cursiva: _texto_
          .replace(/_([^_\n]+)_/g, '<span class="md-marker">_<\/span><i>$1<\/i><span class="md-marker">_<\/span>')
          // Tachado: ~texto~
          .replace(/~([^~\n]+)~/g, '<span class="md-marker">~<\/span><s>$1<\/s><span class="md-marker">~<\/span>');
      };

      const toHtml = (str) => {
        const lines = str.split('\n');
        const out = [];
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          // Lista con viñetas
          if (/^\s*([*-])\s+\S+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*([*-])\s+\S+/.test(lines[i])) {
              const text = lines[i].replace(/^\s*([*-])\s+/, '');
              items.push('<li>' + formatInline(text) + '</li>');
              i++;
            }
            out.push('<ul>' + items.join('') + '</ul>');
            continue;
          }
          // Lista numerada (si accidentalmente vino con '- 1. texto', limpiamos el guión)
          if (/^\s*(?:[-*]\s+)?\d+\.\s+\S+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*(?:[-*]\s+)?\d+\.\s+\S+/.test(lines[i])) {
              const cleaned = lines[i].replace(/^\s*[-*]\s+/, '');
              const text = cleaned.replace(/^\s*\d+\.\s+/, '');
              items.push('<li>' + formatInline(text) + '</li>');
              i++;
            }
            out.push('<ol>' + items.join('') + '</ol>');
            continue;
          }
          // Cita
          if (/^\s*>\s+\S+/.test(line)) {
            const parts = [];
            while (i < lines.length && /^\s*>\s+\S+/.test(lines[i])) {
              parts.push(formatInline(lines[i].replace(/^\s*>\s+/, '')));
              i++;
            }
            out.push('<blockquote>' + parts.join('<br>') + '</blockquote>');
            continue;
          }
          // Línea normal: no añadir <br> al final; separaremos con join
          out.push(formatInline(line));
          i++;
        }
        return out.join('<br>');
      };

      let htmlWithToken = toHtml(textWithToken);
      htmlWithToken = htmlWithToken.replace('[[CARET]]', '<span id="__caret__"></span>');

      this.isTypingUpdate = true;
      el.innerHTML = htmlWithToken;
  // input inner lengths

      // Restaurar caret en el marcador
      const marker = el.querySelector('#__caret__');
      if (marker) {
        const range = document.createRange();
        range.setStartAfter(marker);
        range.collapse(true);
        const sel2 = window.getSelection();
        sel2.removeAllRanges();
        sel2.addRange(range);
        marker.parentNode.removeChild(marker);
  // caret restored
      }

      this.post.description = text;
      this.$nextTick(() => { this.isTypingUpdate = false; });
    },
    onKeydown(e) {
      if (e.key !== 'Enter') return;
      const el = this.$refs.editable;
      if (!el) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const anchor = sel.anchorNode;

      // Utilidad para subir en el árbol hasta tag
      const closestTag = (node, tagNames) => {
        const set = Array.isArray(tagNames) ? new Set(tagNames) : new Set([tagNames]);
        let n = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode);
        while (n) {
          if (n.nodeType === Node.ELEMENT_NODE && set.has(n.nodeName)) return n;
          n = n.parentNode;
        }
        return null;
      };

      const li = closestTag(anchor, 'LI');
      if (!li) return; // fuera de listas: comportamiento por defecto

      const list = closestTag(li, ['UL', 'OL']);
      if (!list) return;

      const liText = (li.innerText || '').trim();

      // Si la viñeta/ítem está vacío: salir de la lista y crear una línea normal debajo
      if (liText === '') {
        e.preventDefault();
        const parent = list.parentNode;
        // Quitar el LI vacío; si es el único, quitar la lista también
        if (list.children.length <= 1) {
          const br = document.createElement('br');
          parent.insertBefore(br, list.nextSibling);
          parent.removeChild(list);
          // Colocar caret tras el br
          this.placeCaretAfterNode(br);
        } else {
          const nextSibling = list.nextSibling;
          li.parentNode.removeChild(li);
          // Insertar un br tras la lista para romper el flujo de numeración
          if (!nextSibling || nextSibling.nodeName !== 'BR') {
            const br = document.createElement('br');
            list.parentNode.insertBefore(br, nextSibling);
            this.placeCaretAfterNode(br);
          } else {
            this.placeCaretAfterNode(nextSibling);
          }
        }
        // Sincronizar modelo tras la modificación manual del DOM
        this.onMarkdownInput();
        return;
      }
      // Ítem con contenido: permitir comportamiento por defecto (creará nuevo LI)
    },
    onEditorFocus() {
  // editor focus
    },
    // Genera HTML desde texto plano (sin token). Reutiliza las mismas reglas del editor
    formatToHtml(str) {
      const formatInline = (s) => {
        return String(s || '')
          .replace(/```([^`\n]+)```/g, '<code class="mono">$1</code>')
          .replace(/`([^`\n]+)`/g, '<code>$1</code>')
          .replace(/\*([^*\n]+)\*/g, '<span class="md-marker">*</span><b>$1<\/b><span class="md-marker">*</span>')
          .replace(/_([^_\n]+)_/g, '<span class="md-marker">_<\/span><i>$1<\/i><span class="md-marker">_<\/span>')
          .replace(/~([^~\n]+)~/g, '<span class="md-marker">~<\/span><s>$1<\/s><span class="md-marker">~<\/span>');
      };
      const lines = String(str || '').split('\n');
      const out = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (/^\s*(?:[-*])\s+\S+/.test(line) && !/^\s*(?:[-*])\s+\d+\.\s+\S+/.test(line)) {
          const items = [];
          while (i < lines.length && /^\s*(?:[-*])\s+\S+/.test(lines[i]) && !/^\s*(?:[-*])\s+\d+\.\s+\S+/.test(lines[i])) {
            const text = lines[i].replace(/^\s*([*-])\s+/, '');
            items.push('<li>' + formatInline(text) + '</li>');
            i++;
          }
          out.push('<ul>' + items.join('') + '</ul>');
          continue;
        }
        if (/^\s*\d+\.\s+\S+/.test(line)) {
          const items = [];
          while (i < lines.length && /^\s*\d+\.\s+\S+/.test(lines[i])) {
            const text = lines[i].replace(/^\s*\d+\.\s+/, '');
            items.push('<li>' + formatInline(text) + '</li>');
            i++;
          }
          out.push('<ol>' + items.join('') + '</ol>');
          continue;
        }
        if (/^\s*>\s+\S+/.test(line)) {
          const parts = [];
          while (i < lines.length && /^\s*>\s+\S+/.test(lines[i])) {
            parts.push(formatInline(lines[i].replace(/^\s*>\s+/, '')));
            i++;
          }
          out.push('<blockquote>' + parts.join('<br>') + '</blockquote>');
          continue;
        }
        out.push(line ? formatInline(line) : '<br>');
        i++;
      }
      return out.join('');
    },
    // Convierte el DOM del editor a texto plano preservando viñetas y numeración
    extractPlainText(rootEl) {
      function normalizeSpaces(s) {
        return String(s || '')
          .replace(/\u00A0/g, ' ')
          .replace(/\u200B/g, '')
          .replace(/\r\n?/g, '\n');
      }
      const parts = [];
      function walk(node) {
        if (!node) return;
        const name = node.nodeName;
        if (node.nodeType === Node.TEXT_NODE) {
          parts.push(node.textContent);
          return;
        }
        if (name === 'BR') {
          parts.push('\n');
          return;
        }
        if (name === 'UL') {
          const items = Array.from(node.children).filter((n) => n.nodeName === 'LI');
          items.forEach((li, idx) => {
            const txt = (li.innerText || '');
            // Si el contenido del LI parece una línea numerada, respétalo como tal en vez de forzarlo a viñeta
            const isNumbered = /^\s*\d+\.\s+\S+/.test(txt);
            const line = isNumbered ? txt : ('- ' + txt);
            parts.push(line);
            if (idx < items.length - 1) parts.push('\n');
          });
          return;
        }
        if (name === 'OL') {
          const items = Array.from(node.children).filter((n) => n.nodeName === 'LI');
          items.forEach((li, idx) => {
            const line = (idx + 1) + '. ' + (li.innerText || '');
            parts.push(line);
            if (idx < items.length - 1) parts.push('\n');
          });
          return;
        }
        if (name === 'DIV' || name === 'P' || name === 'BLOCKQUOTE') {
          const beforeLen = parts.length;
          Array.from(node.childNodes).forEach(walk);
          // Añadir salto entre bloques si no terminó en salto
          if (parts.length > 0 && parts[parts.length - 1] !== '\n') parts.push('\n');
          return;
        }
        Array.from(node.childNodes).forEach(walk);
      }
      walk(rootEl);
      let text = normalizeSpaces(parts.join(''));
      // Evitar saltos dobles accidentales (permitimos como máx. uno)
      text = text.replace(/\n{2,}/g, '\n');
      return text;
    },
    renderDescriptionToEditor() {
      const el = this.$refs.editable;
      if (!el) {
  // renderDescriptionToEditor: ref not available
        return;
      }
      const txt = this.post.description || '';
  // renderDescriptionToEditor text length
      el.innerHTML = this.formatToHtml(txt);
  // render inner lengths
      if ((el.innerText || '').trim() === '' && txt.trim() !== '') {
        console.warn('[Crear] render: innerText vacío; fallback a texto plano');
        el.innerText = txt;
      }
      this.placeCaretAtEnd(el);
    },
    placeCaretAtEnd(el) {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.warn('[Crear] placeCaretAtEnd error', err);
      }
    },
    placeCaretAfterNode(node) {
      try {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.warn('[Crear] placeCaretAfterNode error', err);
      }
    },
    focusInput() {
      if (this.$refs.editable) {
        this.$refs.editable.focus();
        // colocar caret al final
        this.placeCaretAtEnd(this.$refs.editable);
      }
    },
    setCaretByOffset(el, offset) {
      const range = document.createRange();
      const sel = window.getSelection();
      let node = el.firstChild;
      let traversed = 0;
      function nextNode(n) {
        if (n.firstChild) return n.firstChild;
        while (n && !n.nextSibling) n = n.parentNode;
        return n ? n.nextSibling : null;
      }
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const len = node.textContent.length;
          if (traversed + len >= offset) {
            range.setStart(node, offset - traversed);
            range.collapse(true);
            break;
          }
          traversed += len;
        } else if (node.nodeName === "BR") {
          if (traversed + 1 >= offset) {
            range.setStartAfter(node);
            range.collapse(true);
            break;
          }
          traversed += 1;
        }
        node = nextNode(node);
      }
      if (!node) {
        range.selectNodeContents(el);
        range.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(range);
    },
    getCaretOffset(el) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return 0;
      const range = sel.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(el);
      preRange.setEnd(range.endContainer, range.endOffset);
      const walker = document.createTreeWalker(preRange.commonAncestorContainer || el, NodeFilter.SHOW_ALL, null);
      let offset = 0;
      function count(node) {
        if (node.nodeType === Node.TEXT_NODE) offset += node.textContent.length;
        if (node.nodeName === "BR") offset += 1;
        let c = node.firstChild;
        while (c) { count(c); c = c.nextSibling; }
      }
      count(preRange.cloneContents());
      return offset;
    },
    parseMarkdown(str) {
      if (!str) return "";
      // escapamos caracteres HTML primero
      let out = String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // reglas simples (WhatsApp-like)
      // **bold** o *bold*
      out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      out = out.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
      // _italic_
      out = out.replace(/_(.*?)_/g, "<em>$1</em>");
      // ~strike~
      out = out.replace(/~(.*?)~/g, "<del>$1</del>");
      // links [text](http...)
      out = out.replace(
        /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      // convert simple urls to links (http... or www.)
      out = out.replace(
        /(^|\s)(https?:\/\/[^\s<>]+)(\s|$)/g,
        '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>$3'
      );
      out = out.replace(
        /(^|\s)(www\.[^\s<>]+)(\s|$)/g,
        '$1<a href="http://$2" target="_blank" rel="noopener noreferrer">$2</a>$3'
      );

      // saltos de línea
      out = out.replace(/\n/g, "<br>");
      return out;
    },

    // ----------------- ARCHIVO -----------------
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
          this.errors.image = "Solo se permiten JPEG, PNG, GIF o WEBP.";
          this.selectedFileName = "";
          this.post.image = null;
          this.imagePreviewUrl = "";
          return;
        }
        this.selectedFileName = file.name;
        this.post.image = file;
        this.errors.image = "";
        this.imagePreviewUrl = URL.createObjectURL(file);
      } else {
        this.selectedFileName = "";
        this.post.image = null;
        this.imagePreviewUrl = "";
      }
    },

    // ----------------- INGREDIENTES -----------------
    addIngredient() {
      const lastIdx = this.post.ingredients.length - 1;
      const lastIngr = this.post.ingredients[lastIdx];

      // Validar último ingrediente
      if (!lastIngr.name || !lastIngr.name.trim()) {
        this.errors[`ingredient_name_${lastIdx}`] = "El nombre es requerido.";
        return;
      }
      if (lastIngr.quantity === "" || lastIngr.quantity == null) {
        this.errors[`ingredient_quantity_${lastIdx}`] =
          "La cantidad es requerida.";
        return;
      }
      if (!lastIngr.unit || !lastIngr.unit.trim()) {
        this.errors[`ingredient_unit_${lastIdx}`] = "La unidad es requerida.";
        return;
      }

      // Limpiar errores y agregar uno nuevo
      this.errors[`ingredient_name_${lastIdx}`] = "";
      this.errors[`ingredient_quantity_${lastIdx}`] = "";
      this.errors[`ingredient_unit_${lastIdx}`] = "";
      this.post.ingredients.push({ name: "", quantity: "", unit: "" });
    },

    removeIngredient(index) {
      if (this.post.ingredients.length > 1) {
        this.post.ingredients.splice(index, 1);
      }
    },

    removeLastIngredient() {
      if (this.post.ingredients.length > 1) {
        this.post.ingredients.pop();
      }
    },

    updateIngredient(index, updated) {
      this.post.ingredients.splice(index, 1, updated);
    },

    parseIngredients(raw) {
      // Acepta array de objetos o string JSON (tolerante a claves sin comillas)
      if (!raw) return [{ name: "", quantity: "", unit: "" }];
      let arr = raw;
      if (typeof raw === 'string') {
        try {
          const validJSON = raw.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          arr = JSON.parse(validJSON);
        } catch (e) {
          return [{ name: "", quantity: "", unit: "" }];
        }
      }
      if (!Array.isArray(arr)) return [{ name: "", quantity: "", unit: "" }];

      return arr.map((ing) => {
        const quantity = ing?.quantity ?? "";
        const parts = String(quantity).trim().split(/\s+/);
        const [value, ...unitParts] = parts;
        return {
          name: ing?.name || "",
          quantity: value || "",
          unit: unitParts.join(" ") || "",
        };
      });
    },

    // ----------------- VALIDACIONES -----------------
    validateTitle() {
      if (!this.post.title || !this.post.title.trim()) {
        this.errors.title = "El título es requerido.";
      } else if (this.post.title.trim().length < 3) {
        this.errors.title = "Debe tener al menos 3 caracteres.";
      } else {
        this.errors.title = "";
      }
    },

    validateDescription() {
      if (!this.post.description || !this.post.description.trim()) {
        this.errors.content = "La descripción es requerida.";
      } else if (this.post.description.trim().length < 10) {
        this.errors.content = "Debe tener al menos 10 caracteres.";
      } else {
        this.errors.content = "";
      }
    },

    validateIngredients() {
      this.errors.ingredients = "";
      this.post.ingredients.forEach((ing, i) => {
        if (!ing.name || !ing.name.trim()) {
          this.errors[`ingredient_name_${i}`] = "El nombre es requerido.";
        } else {
          this.errors[`ingredient_name_${i}`] = "";
        }
        if (ing.quantity === "" || ing.quantity == null) {
          this.errors[`ingredient_quantity_${i}`] = "La cantidad es requerida.";
        } else if (ing.quantity <= 0) {
          this.errors[`ingredient_quantity_${i}`] = "Debe ser mayor a 0.";
        } else {
          this.errors[`ingredient_quantity_${i}`] = "";
        }
        if (!ing.unit || !ing.unit.trim()) {
          this.errors[`ingredient_unit_${i}`] = "La unidad es requerida.";
        } else {
          this.errors[`ingredient_unit_${i}`] = "";
        }
      });
    },

    validateIngredientName(index) {
      const ing = this.post.ingredients[index];
      if (!ing.name || !ing.name.trim()) {
        this.errors[`ingredient_name_${index}`] = "El nombre es requerido.";
      } else {
        this.errors[`ingredient_name_${index}`] = "";
      }
    },

    validateIngredientQuantity(index) {
      const ing = this.post.ingredients[index];
      if (ing.quantity === "" || ing.quantity == null) {
        this.errors[`ingredient_quantity_${index}`] =
          "La cantidad es requerida.";
      } else if (ing.quantity <= 0) {
        this.errors[`ingredient_quantity_${index}`] =
          "La cantidad debe ser mayor a 0.";
      } else {
        this.errors[`ingredient_quantity_${index}`] = "";
      }
    },

    validateIngredientUnit(index) {
      const ing = this.post.ingredients[index];
      if (!ing.unit || !ing.unit.trim()) {
        this.errors[`ingredient_unit_${index}`] = "La unidad es requerida.";
      } else {
        this.errors[`ingredient_unit_${index}`] = "";
      }
    },

    handleIngredientValidation(isValid) {
      this.isIngredientListValid = isValid;
    },

    // ----------------- FORM / SUBMIT -----------------
    validateForm() {
      this.validateTitle();
      this.validateDescription();
      return (
        !Object.values(this.errors).some((e) => e) && this.isIngredientListValid
      );
    },

    async handleSubmit() {
      if (this.loading) return;
      if (!this.validateForm()) {
        this.notificationStore.show(
          "Por favor, completa todos los campos antes de enviar.",
          "error"
        );
        return;
      }

      this.loading = true;

      const ingredientsPayload = this.post.ingredients.map((ing) => ({
        name: ing.name,
        quantity: `${ing.quantity} ${ing.unit}`.trim(),
      }));

      const formData = new FormData();
      formData.append("title", this.post.title);
      formData.append("description", this.post.description);
      formData.append("is_private", this.post.is_private);
      formData.append("ingredients", JSON.stringify(ingredientsPayload));

      // Solo adjuntar imagen si es un archivo nuevo (File), no URL
      if (this.post.image && this.post.image instanceof File) {
        formData.append("imagen", this.post.image);
      }

      // Añadimos el método override si estamos editando
      if (this.postToEdit) {
        formData.append("_method", "PUT");
      }

      try {
        const response = this.postToEdit
          ? await apiService.updatePost(this.postToEdit.id, formData)
          : await apiService.createPost(formData);

        if (response.data.status === "success") {
          const updatedPost = response.data.data;

          // Actualizamos localmente el post con la respuesta del backend
          this.post.title = updatedPost.title || "";
          this.post.description = updatedPost.description || "";
          this.post.is_private = updatedPost.is_private || false;
          this.post.ingredients = this.parseIngredients(
            updatedPost.ingredients
          );
          this.post.image = null; // No hay archivo nuevo seleccionado
          this.imagePreviewUrl = updatedPost.imagen || "";

          // Emitimos el evento para notificar al padre
          this.$emit(
            this.postToEdit ? "post-updated" : "post-created",
            updatedPost
          );
          this.closeModal();
        }
      } catch (err) {
        if (err.response && err.response.data) {
          console.error("Error backend:", err.response.data);
          this.notificationStore.show(
            "Error: " + JSON.stringify(err.response.data),
            "error"
          );
        } else {
          console.error("Error al procesar el post:", err);
          this.notificationStore.show(
            "Ocurrió un error al procesar el formulario.",
            "error"
          );
        }
      } finally {
        this.loading = false;
      }
    },

    nextStep() {
      if (this.currentStep === 1) {
        const hasImageFile = this.post.image instanceof File;
        const hasImageUrl =
          this.imagePreviewUrl && this.imagePreviewUrl.trim() !== "";

        if (!hasImageFile && !hasImageUrl) {
          this.errors.image = "Debes seleccionar una imagen.";
          return;
        } else {
          this.errors.image = "";
        }
      }

      if (
        this.currentStep === 2 &&
        (!this.post.title || !this.post.description)
      ) {
        this.validateTitle();
        this.validateDescription();
        return;
      }

      this.currentStep++;
    },

    prevStep() {
      this.currentStep--;
    },

    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.crear-post-container {
  grid-area: var(--main-area);
  background-color: var(--secundary-color);
  border-radius: 10px;
  width: 90%;
  margin: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-width: 700px;
  max-height: 600px;
}

.crear-post-container header {
  background-color: var(--primary-color);
  border-radius: 10px 10px 0 0;
  padding: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.crear-post-container header h2 {
  font-size: 24px;
  color: var(--text-color-important);
}

.close-button {
  position: absolute;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-important);
  cursor: pointer;
}

section main {
  padding: 50px;
  flex: 1;
  display: flex;
  flex-direction: row;
  height: auto;
}

form {
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  align-content: center;
}

.image-preview {
  width: 30%;
  height: auto;
}

img {
  max-width: 100%;
  max-height: 80px;
  margin: 20px auto;
  border-radius: 10px;
}

input,
textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  color: black;
  font-size: 16px;
  background-color: white;
}

textarea {
  min-height: 60px;
  resize: none;
}

.error {
  display: block;
  color: var(--contrast-color);
  font-size: 14px;
  margin-top: 5px;
  width: 90%;
}

.input-with-error {
  display: flex;
  flex-direction: row;
  flex: 1;
  align-content: center;
  align-items: stretch;
  gap: 1em;
  width: 100%;
}

.input-ingredient {
  width: 100px;
  padding: 10px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  background-color: white;
  color: black;
  font-size: 14px;
}

.small-textarea {
  min-height: 80px;
}

.ingredients-container {
  margin-top: 20px;
}

.ingredients-list {
  max-height: 300px;
  overflow-y: hidden;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: baseline;
}

.ingredient-input {
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin-bottom: 5px;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1em;
}

.input-group {
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: stretch;
  gap: 1em;
  width: 100%;
}

.global-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 1em;
}

.add-button,
.remove-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 14px;
}

.remove-button {
  background-color: var(--contrast-color);
}

.add-button:hover,
.remove-button:hover {
  opacity: 0.9;
}

.remove-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.unit-select {
  padding: 10px;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  background-color: white;
  color: black;
  font-size: 14px;
  width: 100%;
}

.submit-button {
  width: 100%;
  max-width: 300px;
  padding: 15px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  background: var(--contrast-color);
  color: var(--text-color);
  transition: background-color 0.2s;
  margin: 1em auto;
}

.submit-button:hover {
  opacity: 0.9;
}

.counter {
  font-size: 0.85em;
  color: var(--text-color);
  text-align: right;
  margin-top: 4px;
  display: block;
}

.file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.upload-button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.upload-button:hover {
  background-color: var(--primary-color-dark);
}

.file-name {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-color);
  text-align: center;
  word-wrap: break-word;
}

.navegation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.prev-button,
.next-button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.prev-button:hover,
.next-button:hover,
.submit-button:hover {
  background-color: var(--primary-color-dark);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* --- NUEVOS ESTILOS PARA EL INPUT MARKDOWN --- */
.markdown-input {
  position: relative;
  border: 1px solid var(--sombra-color);
  border-radius: 6px;
  background: white;
  min-height: 80px;
  padding: 12px;
  font-size: 16px;
  color: black;
  overflow-y: auto;
  cursor: text;
}

/* Editor único */
.editor {
  min-height: 80px;
  padding: 12px;
  font-size: 16px;
  border-radius: 6px;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  caret-color: black;
  color: black;
  background: white;
}

/* Los marcadores de sintaxis se vuelven invisibles para conservar el estilo al teclear espacios */
.md-marker {
  color: inherit;
  display: inline;
}

/* estilos visuales para markdown */
.editor b {
  font-weight: bold;
}

.editor i {
  font-style: italic;
}

.editor s {
  text-decoration: line-through;
}

.editor code {
  background: #f5f5f5;
  padding: 0 3px;
  border-radius: 3px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.editor code.mono {
  display: inline-block;
  padding: 2px 4px;
}

.editor ul {
  margin: 6px 0;
  padding-left: 20px;
  list-style: disc;
  list-style-position: inside;
}

.editor ol {
  margin: 6px 0;
  padding-left: 22px;
  list-style: decimal;
  list-style-position: inside;
}

.editor blockquote {
  border-left: 3px solid #aaa;
  margin: 6px 0;
  padding-left: 8px;
  color: #555;
}

.placeholder {
  color: #aaa;
}

/* Media queries para responsivo */
@media (max-width: 768px) {
  .crear-post-container main {
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 20px;
  }

  form {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .ingredients-container {
    margin: 0;
  }

  .input-ingredient {
    width: 100%;
  }

  .ingredient-input {
    gap: 0;
  }

  .image-preview {
    width: 20%;
  }

  img {
    margin: 0;
  }
}

@media (max-width: 480px) {
  section main {
    padding: 30px;
  }

  input,
  textarea,
  button[type="submit"] {
    padding: 12px;
  }

  button[type="submit"] {
    margin: 1em;
  }

  .input-with-error {
    flex-direction: column;
    gap: 0;
  }

  .unit-select {
    width: 100%;
  }
}
</style>

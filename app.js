import { getRandomPalette } from "./utils/palette.js";

const app = Vue.createApp({
  data() {
    return {
      isLoading: false,
      palettes: [],
      selectedPalette: [],
      categories: [
        { value: "warm", label: "Cálida" },
        { value: "cool", label: "Fría" },
        { value: "neutral", label: "Neutra" },
        { value: "vibrant", label: "Vibrante" },
      ],
      modes: [
        { value: "light", label: "Claro" },
        { value: "dark", label: "Oscuro" },
      ],
      modal: {
        show: false,
        message: "",
        type: "alert",
        onConfirm: null,
      },
    };
  },

  methods: {
    showAlert(message) {
      this.modal = {
        show: true,
        message,
        type: "alert",
        onConfirm: null,
      };
    },
    showConfirm(message, onConfirm) {
      this.modal = {
        show: true,
        message,
        type: "confirm",
        onConfirm,
      };
    },
    closeModal() {
      this.modal.show = false;
    },
    handleConfirm() {
      if (this.modal.onConfirm) {
        this.modal.onConfirm();
      }
      this.closeModal();
    },
    createPalette(palette) {
      //! Acá ocurre que palette se borra antes de que se termine de crear debido al set time out, por eso se me ocurrio crear una copia
      const paletteData = { ...palette };
      const paletteSelected = [...this.selectedPalette];
      this.selectedPalette = [];
      this.isLoading = true;
      setTimeout(() => {
        const newPalette = {
          id: Date.now(),
          name: paletteData.name,
          description: paletteData.description,
          category: this.categories.find(
            (category) => category.value === paletteData.category
          ).label,
          mode: paletteData.mode === "dark" ? "Oscuro" : "Claro",
          colors: paletteSelected,
        };
        this.palettes.push(newPalette);
        localStorage.setItem("palettes", JSON.stringify(this.palettes));
        this.isLoading = false;
        this.showAlert("¡Paleta creada exitosamente!");
      }, 1500);
    },
    deletePalette(id) {
      this.showConfirm("¿Estás seguro de eliminar esta paleta?", () => {
        this.isLoading = true;
        setTimeout(() => {
          this.palettes = this.palettes.filter((palette) => palette.id !== id);
          localStorage.setItem("palettes", JSON.stringify(this.palettes));
          this.isLoading = false;
          this.showAlert("Paleta eliminada exitosamente");
        }, 500);
      });
    },
    setSelectedPalette(palette) {
      this.selectedPalette = palette;
    },
  },

  mounted() {
    const storedPalettes = localStorage.getItem("palettes");
    if (storedPalettes) {
      this.palettes = JSON.parse(storedPalettes);
    }
  },
});

// Palette Creator
app.component("palette-creator", {
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    modes: {
      type: Array,
      required: true,
    },
    createPalette: {
      type: Function,
      required: true,
    },
    setSelectedPalette: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        name: "",
        description: "",
        category: "",
        mode: "",
      },
      errorForm: {
        name: "",
        description: "",
        category: "",
        mode: "",
      },
    };
  },
  watch: {
    "formData.category": function () {
      if (this.formData.category && this.formData.mode) {
        const randomPalette = getRandomPalette(
          this.formData.category,
          this.formData.mode
        );
        this.setSelectedPalette(randomPalette.colors);
      }
    },
    "formData.mode": function () {
      if (this.formData.category && this.formData.mode) {
        const randomPalette = getRandomPalette(
          this.formData.category,
          this.formData.mode
        );
        this.setSelectedPalette(randomPalette.colors);
      }
    },
  },
  methods: {
    submitForm() {
      this.validateForm();

      if (
        this.errorForm.name ||
        this.errorForm.description ||
        this.errorForm.category ||
        this.errorForm.mode
      ) {
        return;
      }

      if (
        this.formData.mode &&
        this.formData.category &&
        this.formData.name &&
        this.formData.description &&
        !this.isLoading
      ) {
        this.createPalette(this.formData);
        this.resetForm();
      }
    },
    resetForm() {
      this.formData.name = "";
      this.formData.description = "";
      this.formData.category = "";
      this.formData.mode = "";
    },
    validateInput(field, value) {
      switch (field) {
        case "name":
          if (!value) {
            this.errorForm.name = "El nombre es obligatorio";
            return this.errorForm.name;
          }
          if (value.length < 3) {
            this.errorForm.name = "El nombre debe tener al menos 3 caracteres";
            return this.errorForm.name;
          }
          if (value.length > 20) {
            this.errorForm.name = "El nombre debe tener menos de 20 caracteres";
            return this.errorForm.name;
          }
          this.errorForm.name = "";
          break;

        case "description":
          if (!value) {
            this.errorForm.description = "La descripción es obligatoria";
            return this.errorForm.description;
          }
          if (value.length < 10) {
            this.errorForm.description =
              "La descripción debe tener al menos 10 caracteres";
            return this.errorForm.description;
          }
          if (value.length > 40) {
            this.errorForm.description =
              "La descripción debe tener menos de 40 caracteres";
            return this.errorForm.description;
          }
          this.errorForm.description = "";
          break;

        case "category":
          if (!value) {
            this.errorForm.category = "La categoría es obligatoria";
            return this.errorForm.category;
          }
          this.errorForm.category = "";
          break;

        case "mode":
          if (!value) {
            this.errorForm.mode = "El modo es obligatorio";
            return this.errorForm.mode;
          }
          this.errorForm.mode = "";

        default:
          this.errorForm[field] = "";
          break;
      }
    },
    validateForm() {
      this.validateInput("name", this.formData.name);
      this.validateInput("description", this.formData.description);
      this.validateInput("category", this.formData.category);
      this.validateInput("mode", this.formData.mode);
    },
    updateMode(mode) {
      this.formData.mode = mode;
      this.validateInput("mode", mode);
    },
  },
  template: `
    <form @submit.prevent="submitForm" class="palette-creator">
      <div class="form-field">
        <label for="name">Nombre de paleta:</label>
        <input
          id="name"
          v-model.trim="formData.name"
          type="text"
          placeholder="La mejor paleta de todas"
          @blur="validateInput('name', formData.name)"
        />
        <small>{{errorForm.name}}</small>
      </div>

      <div class="form-field">
        <label for="description">Descripción:</label>
        <input
          id="description"
          v-model.trim="formData.description"
          type="text"
          placeholder="Descripción de la mejor paleta"
          @blur="validateInput('description', formData.description)"
        />
        <small>{{errorForm.description}}</small>
      </div>

      <div class="form-field">
        <label for="category">Categoría:</label>
        <select
          id="category"
          v-model.trim="formData.category"
          @change="validateInput('category', formData.category)"
        >
          <option value="" disabled>Selecciona una categoría</option>
          <option v-for="category in categories" v-bind:value="category.value">
            {{ category.label }}
          </option>
        </select>
        <small>{{errorForm.category}}</small>
      </div>
      <div class="form-field">
        <label >Modo:</label>
        <div class="checkbox-group">
            <label v-for="mode in modes">
              <input
                type="checkbox"
                v-bind:checked="formData.mode === mode.value ? true : false"
                class="checkbox"
                @change="updateMode(mode.value)"
              >
              {{ mode.label }}
            </label>
          </div>
          <small>{{errorForm.mode}}</small>
      </div>

      <button type="submit" class="create-palette" v-bind:disabled="isLoading">Crear paleta</button>
    </form>
  `,
});

// Selected Palette
app.component("selected-palette", {
  props: {
    selectedPalette: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {};
  },

  template: `
    <div class="selected-palette">
      <img src="assets/images/selected_palette_bg.png" alt="Paleta de colores seleccionada" />
      <svg width="548" height="476" viewBox="0 0 548 476" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M260.234 111.594L159.71 181.863C150.538 188.275 150.613 201.881 159.856 208.191L261.412 277.523C266.914 281.279 274.167 281.233 279.62 277.408L379.819 207.139C388.964 200.725 388.889 187.151 379.673 180.839L278.442 111.507C272.946 107.743 265.693 107.778 260.234 111.594Z" stroke="#A8A8A8" v-bind:style="{stroke: selectedPalette[1]}"/>
        <path d="M260.234 99.1109L159.71 169.38C150.538 175.792 150.613 189.398 159.856 195.708L261.412 265.04C266.914 268.795 274.167 268.75 279.62 264.925L379.819 194.656C388.964 188.242 388.889 174.668 379.673 168.356L278.442 99.0239C272.946 95.2599 265.693 95.2946 260.234 99.1109Z" fill="black"/>
        <path d="M260.234 99.1109L159.71 169.38C150.538 175.792 150.613 189.398 159.856 195.708L261.412 265.04C266.914 268.795 274.167 268.75 279.62 264.925L379.819 194.656C388.964 188.242 388.889 174.668 379.673 168.356L278.442 99.0239C272.946 95.2599 265.693 95.2946 260.234 99.1109Z" fill="url(#paint0_linear_31_45)" fill-opacity="0.2"/>
        <path d="M260.234 99.1109L159.71 169.38C150.538 175.792 150.613 189.398 159.856 195.708L261.412 265.04C266.914 268.795 274.167 268.75 279.62 264.925L379.819 194.656C388.964 188.242 388.889 174.668 379.673 168.356L278.442 99.0239C272.946 95.2599 265.693 95.2946 260.234 99.1109Z" stroke="#A8A8A8"/>
        <path d="M332.19 159.953L312.448 173.692C306.693 177.698 306.74 186.229 312.539 190.17L332.509 203.744C335.94 206.075 340.454 206.047 343.855 203.672L363.533 189.933C369.272 185.926 369.225 177.415 363.442 173.472L343.536 159.899C340.109 157.562 335.595 157.583 332.19 159.953Z" fill="url(#paint1_radial_31_45)" fill-opacity="0.5" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[3]}"/>
        <path d="M192.375 159.953L172.633 173.692C166.878 177.698 166.925 186.229 172.724 190.17L192.694 203.744C196.124 206.075 200.639 206.047 204.04 203.672L223.717 189.933C229.456 185.926 229.409 177.415 223.626 173.472L203.721 159.899C200.293 157.562 195.779 157.583 192.375 159.953Z" fill="url(#paint2_radial_31_45)" fill-opacity="0.5" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        <path d="M261.454 111.68L241.61 125.49C235.882 129.477 235.896 137.958 241.638 141.925L285.433 172.184C288.767 174.488 293.162 174.551 296.561 172.345L319.963 157.159C324.759 154.047 324.836 147.053 320.11 143.835L272.794 111.622C269.367 109.289 264.856 109.312 261.454 111.68Z" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        <path d="M238.152 191.574L218.309 205.384C212.58 209.371 212.594 217.852 218.337 221.819L262.131 252.078C265.465 254.382 269.86 254.446 273.259 252.24L296.661 237.053C301.457 233.941 301.535 226.947 296.808 223.73L249.492 191.516C246.065 189.183 241.554 189.206 238.152 191.574Z" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        <path d="M224.073 139.245L207.919 150.264C205.61 151.839 205.587 155.236 207.875 156.842L263.63 195.981C265.033 196.966 266.908 196.948 268.291 195.935L284.709 183.915C286.939 182.283 286.881 178.936 284.597 177.381L228.578 139.243C227.219 138.317 225.432 138.318 224.073 139.245Z" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        
        <path d="M409.204 212.294L308.68 282.562C299.508 288.974 299.583 302.58 308.826 308.89L410.382 378.222C415.884 381.978 423.137 381.932 428.591 378.108L528.789 307.839C537.935 301.425 537.859 287.851 528.643 281.538L427.412 212.206C421.916 208.443 414.663 208.477 409.204 212.294Z" stroke="#A8A8A8" v-bind:style="{stroke: selectedPalette[1]}"/>
        <path d="M409.204 199.81L308.68 270.079C299.508 276.491 299.583 290.097 308.826 296.407L410.382 365.739C415.884 369.495 423.137 369.449 428.591 365.624L528.789 295.355C537.935 288.941 537.859 275.367 528.643 269.055L427.412 199.723C421.916 195.959 414.663 195.994 409.204 199.81Z" fill="black"/>
        <path d="M409.204 199.81L308.68 270.079C299.508 276.491 299.583 290.097 308.826 296.407L410.382 365.739C415.884 369.495 423.137 369.449 428.591 365.624L528.789 295.355C537.935 288.941 537.859 275.367 528.643 269.055L427.412 199.723C421.916 195.959 414.663 195.994 409.204 199.81Z" fill="url(#paint3_linear_31_45)" fill-opacity="0.2"/>
        <path d="M409.204 199.81L308.68 270.079C299.508 276.491 299.583 290.097 308.826 296.407L410.382 365.739C415.884 369.495 423.137 369.449 428.591 365.624L528.789 295.355C537.935 288.941 537.859 275.367 528.643 269.055L427.412 199.723C421.916 195.959 414.663 195.994 409.204 199.81Z" stroke="#A8A8A8"/>
        <path d="M481.16 260.652L461.418 274.392C455.663 278.397 455.71 286.928 461.509 290.87L481.479 304.443C484.91 306.775 489.424 306.747 492.825 304.372L512.503 290.633C518.241 286.626 518.194 278.115 512.412 274.171L492.506 260.598C489.079 258.261 484.564 258.283 481.16 260.652Z" fill="url(#paint4_radial_31_45)" fill-opacity="0.5" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[3]}"/>
        <path d="M341.345 260.652L321.603 274.392C315.848 278.397 315.895 286.928 321.694 290.87L341.664 304.443C345.095 306.775 349.609 306.747 353.01 304.372L372.688 290.633C378.427 286.626 378.379 278.115 372.597 274.171L352.691 260.598C349.264 258.261 344.75 258.283 341.345 260.652Z" fill="url(#paint5_radial_31_45)" fill-opacity="0.5" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[3]}"/>
        <path d="M410.425 212.38L390.582 226.19C384.853 230.177 384.868 238.657 390.61 242.625L434.405 272.884C437.739 275.187 442.133 275.251 445.533 273.045L468.935 257.859C473.731 254.746 473.808 247.753 469.082 244.535L421.765 212.322C418.339 209.989 413.828 210.012 410.425 212.38Z" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        <path d="M387.122 292.274L367.279 306.084C361.55 310.071 361.565 318.551 367.307 322.519L411.102 352.778C414.436 355.081 418.83 355.145 422.23 352.939L445.631 337.753C450.428 334.64 450.505 327.647 445.779 324.429L398.462 292.216C395.035 289.883 390.525 289.906 387.122 292.274Z" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        <path d="M373.043 239.944L356.888 250.963C354.579 252.538 354.556 255.936 356.844 257.541L412.599 296.681C414.002 297.666 415.877 297.647 417.26 296.635L433.679 284.614C435.908 282.982 435.85 279.635 433.567 278.08L377.548 239.942C376.188 239.017 374.401 239.017 373.043 239.944Z" stroke="#333333" stroke-width="0.3" v-bind:style="{stroke: selectedPalette[2]}"/>
        <defs>
        <linearGradient id="paint0_linear_31_45" x1="269.724" y1="92.7681" x2="269.724" y2="271.282" gradientUnits="userSpaceOnUse">
        <stop stop-color="#5D5D5D" stop-opacity="0" v-bind:style="{stopColor: selectedPalette[0]}"/>
        <stop offset="1" stop-color="#5D5D5D" v-bind:style="{stopColor: selectedPalette[0]}"/>
        </linearGradient>
        <radialGradient id="paint1_radial_31_45" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(337.965 181.817) rotate(90) scale(25.7992 37.4505)">
        <stop offset="0.41" stop-color="#5D5D5D" stop-opacity="0.17" v-bind:style="{stopColor: selectedPalette[0]}"/>
        <stop offset="1" stop-color="#5D5D5D" stop-opacity="0.84" v-bind:style="{stopColor: selectedPalette[0]}"/>
        </radialGradient>
        <radialGradient id="paint2_radial_31_45" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(198.15 181.817) rotate(90) scale(25.7992 37.4505)">
        <stop offset="0.41" stop-color="#5D5D5D" stop-opacity="0.17" v-bind:style="{stopColor: selectedPalette[0]}"/>
        <stop offset="1" stop-color="#5D5D5D" stop-opacity="0.84" v-bind:style="{stopColor: selectedPalette[0]}"/>
        </radialGradient>
        <linearGradient id="paint3_linear_31_45" x1="418.694" y1="193.467" x2="418.694" y2="371.981" gradientUnits="userSpaceOnUse">
        <stop stop-color="#5D5D5D" stop-opacity="0" v-bind:style="{stopColor: selectedPalette[0]}"/>
        <stop offset="1" stop-color="#5D5D5D" v-bind:style="{stopColor: selectedPalette[0]}"/>
        </linearGradient>
        <radialGradient id="paint4_radial_31_45" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(486.935 282.516) rotate(90) scale(25.7992 37.4505)">
        <stop offset="0.41" stop-color="#5D5D5D" stop-opacity="0.17" v-bind:style="{stopColor: selectedPalette[0]}"/>
        <stop offset="1" stop-color="#5D5D5D" stop-opacity="0.84" v-bind:style="{stopColor: selectedPalette[0]}"/>
        </radialGradient>
        <radialGradient id="paint5_radial_31_45" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(347.12 282.516) rotate(90) scale(25.7992 37.4505)">
        <stop offset="0.41" stop-color="#5D5D5D" stop-opacity="0.17" v-bind:style="{stopColor: selectedPalette[0]}"/>
        <stop offset="1" stop-color="#5D5D5D" stop-opacity="0.84" v-bind:style="{stopColor: selectedPalette[0]}"/>
        </radialGradient>
        </defs>
      </svg>
    </div>
  `,
});

// Palette History
app.component("palette-history", {
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
    palettes: {
      type: Array,
      required: true,
    },
    deletePalette: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    copyColor(color) {
      navigator.clipboard.writeText(color);
      this.$root.showAlert("Color copiado al portapapeles");
    },
  },
  template: `
    <section class="palette-history">
      <div class="history-wrapper">
        <h2>Historial de paletas</h2>
        <div class="palette-list">
          <p v-if="palettes.length === 0">No hay paletas en el historial. Creá una!</p>
          <div v-else v-for="palette in palettes" class="palette-item">
            <button @click="deletePalette(palette.id)" v-bind:disabled="isLoading" class="delete-palette" >X</button>
            <h3>{{ palette.name }}</h3>
            <p>{{palette.description}}</p>
            <div class="palette-info">
              <div class="mode-info">
                <div class="mode-circle"></div>
                <p>{{palette.mode}}</p>
              </div>
              <div class="category-info">
                <div class="category-circle"></div>
                <p>{{palette.category}}</p>
              </div>
            </div>
            <ul class="color-list">
              <li v-for="(color, index) in palette.colors">
                <button @click="copyColor(color)" v-bind:style="{ backgroundColor: color }" class="color-circle"><span>{{ color}}</span></button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
});

// Loading spinner
app.component("loading", {
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
  },
  template: `
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
    </div>
  `,
});

// Modal
app.component("modal", {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "alert",
    },
  },
  methods: {
    confirm() {
      this.$emit("confirm");
      this.close();
    },
    close() {
      this.$emit("close");
    },
    handleOutsideClick(event) {
      if (event.target.classList.contains("modal")) {
        this.close();
      }
    },
  },
  template: `
    <div v-if="show" class="modal" @click="handleOutsideClick">
      <div class="modal-content">
        <p>{{ message }}</p>
        <div class="modal-buttons">
          <button v-if="type === 'alert'" @click="close" class="modal-button-confirm modal-button">Aceptar</button>
          <template v-else>
            <button @click="close" class="modal-button-cancel modal-button">Cancelar</button>
            <button @click="confirm" class="modal-button-confirm modal-button">Aceptar</button>
          </template>
        </div>
      </div>
    </div>
  `,
});

app.mount("#root");

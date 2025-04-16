export default {
  props: ["onClick"],
  template: `
    <button class="button" @click="$emit('click')">
      <slot>Botón</slot>
    </button>
  `,
};

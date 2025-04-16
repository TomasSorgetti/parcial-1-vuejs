export default {
  props: ["todo"],
  template: `
    <div class="todo-item">
      {{ todo.text }}
    </div>
  `,
};

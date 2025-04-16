import MainLayout from "./layouts/MainLayout.js";
import ButtonComponent from "./components/ui/Button.js";
import TodoItem from "./components/ui/TodoItem.js";
import Header from "./layouts/Header.js";
import Footer from "./layouts/Footer.js";
import { addTodo } from "./lib/helpers/todo.js";

const app = Vue.createApp({
  data() {
    return {
      message: "Lista de Tareas",
      todos: [
        { id: 1, text: "Hacer la compra" },
        { id: 2, text: "Estudiar Vue" },
      ],
    };
  },
  methods: {
    addTodo() {
      const newTodo = addTodo(this.todos);
      this.todos.push(newTodo);
    },
  },
});

app.component("main-layout", MainLayout);
app.component("button-component", ButtonComponent);
app.component("todo-item", TodoItem);
app.component("layout-header", Header);
app.component("layout-footer", Footer);

app.mount("#root");

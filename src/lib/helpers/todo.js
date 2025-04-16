export function addTodo(todos) {
  const id = todos.length + 1;
  return { id, text: `Tarea ${id}` };
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES");
}

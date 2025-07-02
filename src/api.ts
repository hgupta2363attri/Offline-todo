import axios from 'axios';
import { Todo } from './schema';

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await axios.get<Todo[]>('https://jsonplaceholder.typicode.com/todos');
  return response.data.slice(0, 20);
};

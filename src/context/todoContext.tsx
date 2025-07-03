import React, { createContext, useReducer, useEffect, useState } from "react";
import { Todo } from "../schema";
import { getData, storeData } from "../utils/storageUtils";

export type Action =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: number };
type Dispatch = (action: Action) => void;

export const TodoContext = createContext<{ todos: Todo[]; dispatch: Dispatch }>({ todos: [], dispatch: () => {} });

/**
 * Reducer function to manage the state of the todos
 * @param state - The current state of the todos
 * @param action - The action to perform on the todos
 * @returns The new state of the todos
 */
const todoReducer = (state: Todo[], action: Action) => {
    switch (action.type) {
        case 'SET_TODOS':
            return action.payload;
        case 'ADD_TODO':
            return [ action.payload,...state];
        case 'UPDATE_TODO':
            return state.map(todo => todo.id === action.payload.id ? action.payload : todo);
        case 'DELETE_TODO':
            return state.filter(todo => todo.id !== action.payload);
        default:
            return state;
    }
}

export const TodoProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [todos, dispatch] = useReducer(todoReducer, []);
    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const storedTodos = await getData<Todo[]>('todos');
                if (storedTodos) {
                    dispatch({ type: 'SET_TODOS', payload: storedTodos });
                }
            } catch (error) {
                console.error('Error loading todos:', error);
            } finally {
                setIsInitialized(true);
            }
        };
        fetchTodos();
    }, []);
    useEffect(() => {
        const saveTodos = async () => {
            try {
                console.log("Saving todos to storage:", todos);
                await storeData('todos', todos);
            } catch (error) {
                console.error('Error saving todos:', error);
            }
        };
        if (isInitialized) {
            saveTodos();
        }
    }, [todos, isInitialized]);

    return (
        <TodoContext.Provider value={{ todos, dispatch }}>
            {children}
        </TodoContext.Provider>
    );
};
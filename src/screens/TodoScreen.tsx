import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { TodoContext } from '../context/todoContext';
import TaskItem from '../components/TaskItem';
import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '../api';
import { Todo } from '../schema';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller } from 'react-hook-form';

const todoFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});
type TodoFormValues = z.infer<typeof todoFormSchema>;

const TodoScreen = () => {
  const { todos, dispatch } = useContext(TodoContext);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed'>('pending');

  const { refetch, isFetching, data } = useQuery<Todo[], Error>({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    enabled: false,
    onSuccess: (data) => {
        console.log(data)
      dispatch({ type: 'SET_TODOS', payload: data });
    },
  });

  // Fetch the todos from the server for online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) refetch();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (data) {
      dispatch({ type: 'SET_TODOS', payload: data });
    }
  }, [data, dispatch]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: { title: '', description: '' },
  });

  /**
   * Add a new task to the list
   * @returns void
   */
  const addTask = (values: TodoFormValues) => {
    const newTodo: Todo = {
      id: Date.now(),
      title: values.title,
      description: values.description,
      completed: false,
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
    reset();
    setSelectedTab('pending');
  };

  /**
   * This method update the task in the list
   * @param id - The id of the task to edit
   * @returns void
   */
  const editTask = (id: number) => {
    if (editTodoId === null) return;
    // Get current form values
    handleSubmit((values) => {
      const updatedTodo: Todo = { title: values.title, description: values.description, id: editTodoId, completed: false };
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
      setEditTodoId(null);
      reset();
    })();
  };

  /**
   * This method is called when the user clicks on the edit button
   * @param todo - The task to edit
   * @returns void
   */
  const onTaskEdit = (todo: Todo) => {
    setEditTodoId(todo.id);
    setValue('title', todo.title);
    setValue('description', todo.description || '');
  };

  const pending = todos.filter(todo => !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Text
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          Pending
        </Text>
        <Text
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          Completed
        </Text>
      </View>

      {/* Card-like Form */}
      <View style={styles.formCard}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor="#aaa"
            />
          )}
        />
        {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor="#aaa"
            />
          )}
        />
        {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}

        <View style={styles.buttonWrapper}>
          <Button
            title={editTodoId ? 'Update Task' : 'Add Task'}
            onPress={editTodoId ? () => editTask(editTodoId) : handleSubmit(addTask)}
            color={editTodoId ? '#007bff' : '#28a745'}
          />
        </View>
      </View>

      {isFetching && <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 10 }} />}

      <FlatList
        data={selectedTab === 'pending' ? pending : completed}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <TaskItem todo={item} dispatch={dispatch}  onTaskEdit={onTaskEdit} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#22223b',
    alignSelf: 'center',
    letterSpacing: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    fontSize: 16,
    color: '#888',
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 0,
    fontWeight: '500',
  },
  activeTab: {
    color: '#007bff',
    backgroundColor: '#fff',
    borderBottomColor: '#007bff',
    fontWeight: 'bold',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderColor: '#e0e1dd',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#22223b',
  },
  inputError: {
    borderColor: '#d11a2a',
  },
  buttonWrapper: {
    marginTop: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  error: {
    color: '#d11a2a',
    marginBottom: 8,
    fontSize: 14,
    marginLeft: 2,
  },
  section: { marginTop: 20, fontSize: 18, fontWeight: '600' },
});

export default TodoScreen;
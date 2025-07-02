import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const TaskItem = ({ todo, dispatch, onTaskEdit }: any) => {
  const toggleStatus = () => {
    dispatch({
      type: 'UPDATE_TODO',
      payload: { ...todo, completed: !todo.completed },
    });
  };

  const deleteTodo = () => {
    dispatch({ type: 'DELETE_TODO', payload: todo.id });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, todo.completed && styles.completedTitle]}>{todo.title}</Text>
        <View style={[styles.statusDot, todo.completed ? styles.completedDot : styles.pendingDot]} />
      </View>
      {!!todo.description && <Text style={styles.desc}>{todo.description}</Text>}
      <View style={styles.row}>
        <View style={styles.actionButtonMain}>
          <Button
            title={todo.completed ? 'Mark Pending' : 'Mark Done'}
            onPress={toggleStatus}
            color={todo.completed ? '#ffc107' : '#28a745'}
          />
        </View>
        <View style={styles.actionButton}>
          <Button title="Edit" onPress={() => onTaskEdit(todo)} color="#007bff" />
        </View>
        <View style={styles.actionButton}>
          <Button title="Delete" onPress={deleteTodo} color="#d11a2a" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#22223b',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  completedDot: {
    backgroundColor: '#28a745',
  },
  pendingDot: {
    backgroundColor: '#ffc107',
  },
  desc: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  actionButtonMain: {
    flex: 1,
    marginHorizontal: 2,
  },
  actionButton: {
    flex: 0.7,
    marginHorizontal: 2,
  },
});

export default TaskItem;

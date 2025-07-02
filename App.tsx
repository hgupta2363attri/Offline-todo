/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import TodoScreen from './src/screens/TodoScreen';
import { TodoProvider } from './src/context/todoContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
const queryClient = new QueryClient();
  return (
    <View style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <TodoProvider>
        <TodoScreen />
        </TodoProvider>
      </QueryClientProvider>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

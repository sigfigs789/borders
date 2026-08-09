import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { GameScreen } from './src/screens/GameScreen';
import { loadSounds } from './src/utils/sounds';

export default function App() {
  useEffect(() => {
    loadSounds();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <GameScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

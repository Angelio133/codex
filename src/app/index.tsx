import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Page d'accueil</Text>
      <Button
        title="Aller aux caméra"
        onPress={() => router.push('/camera')}
      />
    </View>
  );
}
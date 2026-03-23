import { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken, logout } from "../src/auth/auth.store";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      setEmail(await AsyncStorage.getItem("email"));
      setUsername(await AsyncStorage.getItem("username"));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Home ✅</Text>
      <Text>Email: {email}</Text>
      <Text>Username: {username}</Text>

      <Button
        title="Logout"
        onPress={async () => {
          await logout();
          router.replace("/");
        }}
      />
    </View>
  );
}

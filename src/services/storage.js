import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getToken() {
  return await AsyncStorage.getItem("token");
}

export async function clearStorage() {
  await AsyncStorage.clear();
}

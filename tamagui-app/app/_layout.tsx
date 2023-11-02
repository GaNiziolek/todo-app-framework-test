import { Slot, SplashScreen } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import { TamaguiProvider } from "tamagui"
import config from "../tamagui.config"

import { useFonts, Inter_500Medium, Inter_400Regular } from "@expo-google-fonts/inter"
import { useEffect } from "react"

SplashScreen.preventAutoHideAsync()

export default function AppLayout () {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Render the children routes now that all the assets are loaded.
  return (
    <SafeAreaView style={{height: '100%'}}>
      <TamaguiProvider config={config}>
        <Slot/>
      </TamaguiProvider>
    </SafeAreaView>
  )
}
import { Redirect } from 'expo-router';

/**
 * Single entry point. Authentication is not implemented yet, so the app
 * always lands on the temporary welcome screen.
 */
export default function IndexScreen() {
  return <Redirect href="/(auth)/welcome" />;
}

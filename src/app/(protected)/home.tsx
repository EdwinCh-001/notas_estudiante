import { Redirect } from 'expo-router';

export default function ProtectedHomeRedirect() {
  return <Redirect href="/dashboard" />;
}

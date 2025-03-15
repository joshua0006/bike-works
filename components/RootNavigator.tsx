import { useAuth } from '../contexts/AuthContext';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AdminPanel, UserDashboard } from '../screens';
import { CustomDrawer } from './CustomDrawer';

const Drawer = createDrawerNavigator();

export function RootNavigator() {
  const { isAdmin } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {isAdmin ? (
        <Drawer.Screen name="AdminPanel" component={AdminPanel} />
      ) : (
        <Drawer.Screen name="UserDashboard" component={UserDashboard} />
      )}
    </Drawer.Navigator>
  );
} 
/**
 * MainTabNavigator
 * Bottom tab navigation for the dashboard experience
 *
 * @format
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { colors } from '../theme/colors';
import { hs, ms, vs } from '../theme/scaling';
import { typography } from '../theme/fonts';
import DashboardHome from '../screens/dashboard/DashboardHome';
import BookingsScreen from '../screens/dashboard/BookingsScreen';
import ScannerScreen from '../screens/dashboard/ScannerScreen';
import ManageScreen from '../screens/dashboard/ManageScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';

// Icons
import DashboardActiveIcon from '../assets/svg/icons/Dashboard_active.svg';
import DashboardInactiveIcon from '../assets/svg/icons/Dashboard_inactive.svg';
import BookingsActiveIcon from '../assets/svg/icons/Bookings_active.svg';
import BookingsInactiveIcon from '../assets/svg/icons/Bookings_inactive.svg';
import ManageActiveIcon from '../assets/svg/icons/Manage_active.svg';
import ManageInactiveIcon from '../assets/svg/icons/Manage_inactive.svg';
import ProfileActiveIcon from '../assets/svg/icons/Profile_active.svg';
import ProfileInactiveIcon from '../assets/svg/icons/Profile_inactive.svg';
import ScannerIcon from '../assets/svg/icons/Scanner.svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon render helpers
const renderDashboardIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <DashboardActiveIcon width={hs(22)} height={vs(22)} />
  ) : (
    <DashboardInactiveIcon width={hs(22)} height={vs(22)} />
  );

const renderBookingsIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <BookingsActiveIcon width={hs(22)} height={vs(22)} />
  ) : (
    <BookingsInactiveIcon width={hs(22)} height={vs(22)} />
  );

const renderScannerIcon = () => (
  <View style={styles.scannerButton}>
    <ScannerIcon width={hs(28)} height={vs(28)} />
  </View>
);

const renderManageIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <ManageActiveIcon width={hs(22)} height={vs(22)} />
  ) : (
    <ManageInactiveIcon width={hs(22)} height={vs(22)} />
  );

const renderProfileIcon = ({ focused }: { focused: boolean }) =>
  focused ? (
    <ProfileActiveIcon width={hs(22)} height={vs(22)} />
  ) : (
    <ProfileInactiveIcon width={hs(22)} height={vs(22)} />
  );

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardHome}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: renderDashboardIcon,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: renderBookingsIcon,
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: renderScannerIcon,
        }}
      />
      <Tab.Screen
        name="Manage"
        component={ManageScreen}
        options={{
          tabBarLabel: 'Manage',
          tabBarIcon: renderManageIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    // White bar background as requested
    backgroundColor: colors.background.white,
    borderTopColor: colors.border.light,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: vs(64),
    paddingTop: vs(6),
    paddingBottom: vs(6),
  },
  tabBarItem: {
    paddingVertical: 0,
    justifyContent: 'center',
  },
  tabBarLabel: {
    ...typography.body,
    fontSize: 14,
    marginBottom: 0,
  },
  scannerButton: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    // Custom dark gray background as per design (#2F2F2F)
    backgroundColor: '#2F2F2F',
    // Add a little space from the top edge of the tab bar
    marginTop: vs(10),
  },
});

export default MainTabNavigator;



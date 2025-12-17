/**
 * StaffsScreen
 * Screen for managing staff members
 *
 * @format
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Modal, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import { SearchBar } from '../../components/dashboard';
import { vendorService, type StaffMember, type CustomAxiosError } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';
import type { RootStackScreenProps } from '../../navigation/types';
import { useFocusEffect } from '@react-navigation/native';

// Illustration image
const ILLUSTRATION = require('../../assets/webp/staff_illustration.webp');

type StaffsScreenProps = RootStackScreenProps<'Staffs'>;

const StaffsScreen: React.FC<StaffsScreenProps> = ({ navigation }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingStaff, setTogglingStaff] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await vendorService.getStaff(userId);
      
      if (response.success && response.data) {
        setStaffList(response.data);
      } else {
        showError('Failed to load staff list');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to load staff list';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff when screen is focused (e.g., after adding new staff)
  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  // Handle Android hardware back button to navigate to DashboardHome
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Main', {
        screen: 'Dashboard',
        params: {
          screen: 'DashboardHome',
        },
      });
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleToggleActive = async (index: number) => {
    const staff = staffList[index];
    if (!staff) return;

    const newActiveState = !staff.isActive;
    
    try {
      setTogglingStaff(staff.name);
      const userId = await userStorage.getUserId();

      if (!userId) {
        showError('User ID not found. Please login again.');
        return;
      }

      // Optimistically update UI
      const updatedStaff = [...staffList];
      updatedStaff[index].isActive = newActiveState;
      setStaffList(updatedStaff);

      // Call API to update
      const response = await vendorService.updateStaff(
        userId,
        staff.name,
        staff.name, // Keep the same name
        newActiveState
      );

      if (!response.success) {
        // Revert on failure
        const revertedStaff = [...staffList];
        revertedStaff[index].isActive = staff.isActive;
        setStaffList(revertedStaff);
        showError('Failed to update staff status. Please try again.');
      }
    } catch (error) {
      // Revert on error
      const revertedStaff = [...staffList];
      revertedStaff[index].isActive = staff.isActive;
      setStaffList(revertedStaff);
      
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to update staff status. Please try again.';
      showError(errorMessage);
    } finally {
      setTogglingStaff(null);
    }
  };

  const handleMenuPress = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    if (selectedStaff) {
      setMenuVisible(false);
      navigation.navigate('AddStaff', {
        staffName: selectedStaff.name,
        currentName: selectedStaff.name,
        isActive: selectedStaff.isActive,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;

    try {
      setDeleteLoading(true);
      const userId = await userStorage.getUserId();

      if (!userId) {
        showError('User ID not found. Please login again.');
        setMenuVisible(false);
        return;
      }

      const response = await vendorService.deleteStaff(userId, selectedStaff.name);

      if (response.success) {
        showSuccess('Staff member deleted successfully');
        setMenuVisible(false);
        setSelectedStaff(null);
        // Refresh staff list
        fetchStaff();
      } else {
        showError('Failed to delete staff member. Please try again.');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to delete staff member. Please try again.';
      showError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedStaff(null);
  };

  // Filter staff based on search query
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) {
      return staffList;
    }
    return staffList.filter((staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staffList, searchQuery]);

  const hasStaff = staffList.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                // Navigate to DashboardHome instead of going back
                navigation.navigate('Main', {
                  screen: 'Dashboard',
                  params: {
                    screen: 'DashboardHome',
                  },
                });
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <BackIcon width={hs(24)} height={vs(24)} />
            </TouchableOpacity>
            <Text style={styles.title}>Staffs</Text>
          </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
          </View>
        ) : hasStaff ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <SearchBar
                placeholder="Search staff..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Staff List */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredStaff.map((staff, index) => {
                // Find original index for toggle handler
                const originalIndex = staffList.findIndex((s) => s.name === staff.name);
                return (
                  <View key={index} style={styles.staffCard}>
                    <Text style={styles.staffName}>{staff.name}</Text>
                    <View style={styles.rightSection}>
                      <Switch
                        value={staff.isActive}
                        onValueChange={() => handleToggleActive(originalIndex)}
                        disabled={togglingStaff === staff.name}
                        trackColor={{
                          false: colors.border.medium,
                          true: colors.text.primary,
                        }}
                        thumbColor={colors.background.white}
                        ios_backgroundColor={colors.border.medium}
                      />
                      <TouchableOpacity
                        onPress={() => handleMenuPress(staff)}
                        style={styles.menuButton}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuIcon}>
                          <View style={styles.menuDot} />
                          <View style={styles.menuDot} />
                          <View style={styles.menuDot} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Add Staff Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddStaff')}
              >
                <Text style={styles.addButtonText}>Add Staff    +</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Empty State Content */}
            <View style={styles.emptyStateContainer}>
              {/* Illustration */}
              <View style={styles.illustrationContainer}>
                <Image
                  source={ILLUSTRATION}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>

              {/* Empty State Text */}
              <Text style={styles.emptyTitle}>No staffs yet.</Text>
              <Text style={styles.emptyDescription}>
                Add at least one staff so customers can choose who will serve them.
              </Text>
            </View>

            {/* Add Staff Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddStaff')}
              >
                <Text style={styles.addButtonText}>Add Staff    +</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseMenu}
        >
          <TouchableWithoutFeedback onPress={handleCloseMenu}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.menuContainer}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleEdit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={[styles.menuItem, deleteLoading && styles.menuItemDisabled]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                    disabled={deleteLoading}
                  >
                    <Text style={[styles.menuItemText, styles.deleteText]}>
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: hs(16),
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  backButton: {
    marginBottom: vs(12),
    alignSelf: 'flex-start',
    padding: vs(4),
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: hs(24),
  },
  illustrationContainer: {
    marginBottom: vs(24),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustration: {
    width: ms(200),
    height: ms(240),
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(8),
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: hs(32),
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: hs(16),
    paddingBottom: vs(24),
    paddingTop: vs(12),
  },
  addButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: ms(12),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for elevation effect
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: hs(16),
    paddingTop: vs(12),
    paddingBottom: vs(16),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: hs(16),
    paddingBottom: vs(12),
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: ms(12),
    paddingHorizontal: hs(16),
    paddingVertical: vs(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: colors.background.white,
  },
  staffName: {
    ...typography.body,
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '700',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(16),
  },
  menuButton: {
    padding: vs(4),
  },
  menuIcon: {
    flexDirection: 'column',
    gap: vs(3),
  },
  menuDot: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    paddingVertical: vs(8),
    minWidth: hs(150),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(12),
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    ...typography.body,
    fontSize: 16,
    color: colors.text.primary,
  },
  deleteText: {
    color: '#FF3B30',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: vs(4),
  },
});

export default StaffsScreen;


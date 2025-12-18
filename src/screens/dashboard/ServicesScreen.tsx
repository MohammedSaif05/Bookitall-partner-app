/**
 * ServicesScreen
 * Screen for managing services
 *
 * @format
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import { SearchBar } from '../../components/dashboard';
import { vendorService, type Service, type CustomAxiosError } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';
import type { RootStackScreenProps } from '../../navigation/types';
import { useFocusEffect } from '@react-navigation/native';

// Illustration image
const ILLUSTRATION = require('../../assets/webp/illustration_2.webp');

type ServicesScreenProps = RootStackScreenProps<'Services'>;

const ServicesScreen: React.FC<ServicesScreenProps> = ({ navigation }) => {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [togglingService, setTogglingService] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const userId = await userStorage.getUserId();

      if (!userId) {
        showError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await vendorService.getServices(userId);

      if (response.success && response.data) {
        setServicesList(response.data.services || []);
      } else {
        showError('Failed to load services');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to load services';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  // Handle Android hardware back button to navigate to DashboardHome
  useFocusEffect(
    useCallback(() => {
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
    }, [navigation])
  );

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return servicesList;
    }
    const query = searchQuery.toLowerCase();
    return servicesList.filter(
      (service) =>
        service.serviceName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
    );
  }, [servicesList, searchQuery]);

  const hasServices = servicesList.length > 0;

  const handleMenuPress = (service: Service) => {
    setSelectedService(service);
    setMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedService(null);
  };

  const handleEdit = () => {
    if (selectedService) {
      // Navigate to AddService screen with service data for editing
      navigation.navigate('AddService', { service: selectedService });
      handleCloseMenu();
    }
  };

  const handleDelete = async () => {
    if (!selectedService) {
      return;
    }

    try {
      setDeleteLoading(true);
      const userId = await userStorage.getUserId();

      if (!userId) {
        showError('User ID not found. Please login again.');
        handleCloseMenu();
        return;
      }

      const response = await vendorService.deleteService(userId, selectedService.serviceId);

      if (response.success) {
        showSuccess('Service deleted successfully');
        handleCloseMenu();
        // Refresh services list
        await fetchServices();
      } else {
        showError('Failed to delete service. Please try again.');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to delete service. Please try again.';
      showError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleService = async (serviceId: string) => {
    try {
      setTogglingService(serviceId);
      
      const userId = await userStorage.getUserId();
      if (!userId) {
        showError('User ID not found. Please login again.');
        setTogglingService(null);
        return;
      }

      // Find the current service to get its current isActive status
      const currentService = servicesList.find(s => s.serviceId === serviceId);
      if (!currentService) {
        showError('Service not found');
        setTogglingService(null);
        return;
      }

      // Toggle the isActive status
      const newActiveStatus = !(currentService.isActive ?? true);

      // Call API to update service status
      const response = await vendorService.toggleServiceStatus(
        userId,
        serviceId,
        newActiveStatus
      );

      if (response.success) {
        // Update the local state immediately for better UX
        setServicesList(prevServices =>
          prevServices.map(service =>
            service.serviceId === serviceId
              ? { ...service, isActive: newActiveStatus }
              : service
          )
        );
        showSuccess(`Service ${newActiveStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        showError('Failed to update service status');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to update service status';
      showError(errorMessage);
    } finally {
      setTogglingService(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
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
          <Text style={styles.title}>Services</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              scrollEnabled={true}
            >
              {hasServices ? (
                <>
                  {/* Search Bar */}
                  <View style={styles.searchContainer}>
                    <SearchBar
                      placeholder="Search services..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>

                  {/* Services List */}
                  {filteredServices.map((service) => (
                    <View key={service.serviceId} style={styles.serviceCard}>
                      {/* Service Header Row */}
                      <View style={styles.serviceHeader}>
                        {/* Service Image */}
                        <View style={styles.serviceImageContainer}>
                          {service.serviceImage ? (
                            <Image
                              source={{ uri: service.serviceImage }}
                              style={styles.serviceImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.serviceImagePlaceholder}>
                              <Text style={styles.serviceImagePlaceholderText}>
                                {service.serviceName.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Service Name */}
                        <View style={styles.serviceNameContainer}>
                          <Text style={styles.serviceName} numberOfLines={1}>
                            {service.serviceName}
                          </Text>
                        </View>

                        {/* Options Menu */}
                        <TouchableOpacity
                          onPress={() => handleMenuPress(service)}
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

                      {/* Description */}
                      {service.description ? (
                        <Text style={styles.serviceDescription} numberOfLines={2}>
                          {service.description}
                        </Text>
                      ) : null}

                      {/* Service Details Row */}
                      <View style={styles.serviceDetailsRow}>
                        {/* Toggle Switch */}
                        <Switch
                          value={service.isActive ?? true}
                          onValueChange={() => handleToggleService(service.serviceId)}
                          disabled={togglingService === service.serviceId}
                          trackColor={{
                            false: colors.border.medium,
                            true: colors.text.primary,
                          }}
                          thumbColor={colors.background.white}
                          ios_backgroundColor={colors.border.medium}
                        />

                        {/* Cost and Duration */}
                        <View style={styles.costDurationContainer}>
                          <Text style={styles.serviceCost}>
                            ₹{service.serviceCost}
                          </Text>
                          <Text style={styles.serviceDuration}>
                            {service.serviceDuration} mins
                          </Text>
                        </View>
                      </View>

                      {/* Assigned Staff Section */}
                      {service.assignedStaff && service.assignedStaff.length > 0 && (
                        <View style={styles.staffSection}>
                          <Text style={styles.staffSectionTitle}>Assigned Staffs</Text>
                          <Text style={styles.staffList} numberOfLines={1}>
                            {service.assignedStaff.join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
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
                    <Text style={styles.emptyTitle}>No services added yet</Text>
                    <Text style={styles.emptyDescription}>
                      Create services so customers can start booking.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Add Service Button - Fixed at bottom */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddService')}
              >
                <Text style={styles.addButtonText}>Add Service   +</Text>
              </TouchableOpacity>
            </View>
          </View>
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

        {/* Loading Overlay for Toggle */}
        <Modal
          visible={togglingService !== null}
          transparent
          animationType="fade"
          onRequestClose={() => {}} // Prevent closing during toggle
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.text.primary} />
              <Text style={styles.loadingText}>Updating service status...</Text>
            </View>
          </View>
        </Modal>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
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
    paddingBottom: vs(100), // Extra padding for fixed button at bottom
  },
  serviceCard: {
    backgroundColor: 'transparent',
    borderRadius: ms(12),
    paddingHorizontal: hs(16),
    paddingVertical: vs(16),
    marginBottom: vs(12),
    marginHorizontal: hs(16),
    borderWidth: 1,
    borderColor: colors.background.white,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  serviceImageContainer: {
    marginRight: hs(12),
  },
  serviceImage: {
    width: vs(48),
    height: vs(48),
    borderRadius: vs(24),
  },
  serviceImagePlaceholder: {
    width: vs(48),
    height: vs(48),
    borderRadius: vs(24),
    backgroundColor: colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImagePlaceholderText: {
    ...typography.h3,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  serviceNameContainer: {
    flex: 1,
    marginRight: hs(8),
  },
  serviceName: {
    ...typography.body,
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '700',
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
  serviceDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: vs(12),
    lineHeight: 20,
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  costDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(16),
  },
  serviceCost: {
    ...typography.body,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  serviceDuration: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  staffSection: {
    marginTop: vs(4),
  },
  staffSectionTitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(4),
  },
  staffList: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyStateContainer: {
    minHeight: vs(400),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: hs(24),
    paddingVertical: vs(40),
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
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  addButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: ms(12),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    padding: vs(24),
    alignItems: 'center',
    minWidth: hs(120),
  },
  loadingText: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: vs(16),
    textAlign: 'center',
  },
});

export default ServicesScreen;

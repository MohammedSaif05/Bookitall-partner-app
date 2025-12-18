/**
 * AddStaffScreen
 * Screen for adding new staff members
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import { OnboardingCTAButton } from '../../components/onboarding';
import { vendorService, type CustomAxiosError } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';
import type { RootStackScreenProps } from '../../navigation/types';

type AddStaffScreenProps = RootStackScreenProps<'AddStaff'>;

const AddStaffScreen: React.FC<AddStaffScreenProps> = ({ navigation, route }) => {
  const routeParams = route.params;
  const isEditMode = !!routeParams?.currentName;
  
  const [staffName, setStaffName] = useState(routeParams?.staffName || '');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  const isFormComplete = staffName.trim().length > 0;

  const handleSave = async () => {
    if (!userId) {
      showError('User ID not found. Please login again.');
      return;
    }

    if (!isFormComplete) {
      return;
    }

    try {
      setLoading(true);
      
      if (isEditMode && routeParams?.currentName) {
        // Update existing staff
        const response = await vendorService.updateStaff(
          userId,
          routeParams.currentName,
          staffName,
          routeParams.isActive ?? true
        );

        if (response.success) {
          showSuccess('Staff member updated successfully');
          navigation.navigate('Staffs');
        } else {
          showError('Failed to update staff member. Please try again.');
        }
      } else {
        // Add new staff
        const response = await vendorService.addStaff(userId, staffName);

        if (response.success) {
          showSuccess('Staff member added successfully');
          navigation.navigate('Staffs');
        } else {
          showError('Failed to add staff member. Please try again.');
        }
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage = isEditMode
        ? axiosError.response?.data?.message || 'Failed to update staff member. Please try again.'
        : axiosError.response?.data?.message || 'Failed to add staff member. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <BackIcon width={hs(24)} height={vs(24)} />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>
              {isEditMode ? 'Edit Staff' : 'Add Staff'}
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Staff Details</Text>

            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  Staff name<Text style={styles.asterisk}> *</Text>
                </Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                value={staffName}
                onChangeText={setStaffName}
                placeholder="Enter full name"
                placeholderTextColor={colors.text.secondary}
              />
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <OnboardingCTAButton
              label={loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Staff' : 'Save Staff')}
              onPress={handleSave}
              disabled={!isFormComplete || loading}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        </View>

        {/* Loading Overlay */}
        <Modal
          visible={loading}
          transparent
          animationType="fade"
          onRequestClose={() => {}} // Prevent closing during save
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.text.primary} />
              <Text style={styles.loadingText}>
                {isEditMode ? 'Updating staff member...' : 'Saving staff member...'}
              </Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(16),
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  backButton: {
    marginRight: hs(12),
    padding: vs(4),
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
    flexShrink: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: hs(16),
    paddingTop: vs(24),
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(20),
  },
  fieldContainer: {
    paddingVertical: vs(12),
    marginBottom: vs(20),
  },
  labelRow: {
    marginBottom: vs(8),
  },
  fieldLabel: {
    ...typography.label,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  asterisk: {
    color: colors.text.primary,
  },
  fieldInput: {
    ...typography.body,
    fontSize: 16,
    color: colors.text.primary,
    paddingTop: vs(2),
    paddingBottom: 0,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: hs(16),
    paddingBottom: vs(32),
    paddingTop: vs(12),
    gap: hs(12),
  },
  cancelButton: {
    flex: 1,
    borderRadius: ms(12),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: vs(44),
    borderWidth: ms(1.5),
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  saveButton: {
    flex: 1,
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

export default AddStaffScreen;


/**
 * AddBankDetailsScreen
 * Screen for adding bank details
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
import InfoIcon from '../../assets/svg/icons/info.svg';
import { OnboardingCTAButton } from '../../components/onboarding';
import { vendorService, type CustomAxiosError } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';
import type { RootStackScreenProps } from '../../navigation/types';

type AddBankDetailsScreenProps = RootStackScreenProps<'AddBankDetails'>;

const AddBankDetailsScreen: React.FC<AddBankDetailsScreenProps> = ({ navigation }) => {
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  const isFormComplete = 
    accountHolderName.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    ifscCode.trim().length > 0;

  const handleSave = async () => {
    if (!userId) {
      showError('User ID not found. Please login again.');
      return;
    }

    if (!isFormComplete) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Call API to save bank details
      const response = await vendorService.addBankDetails(userId, {
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
      });

      if (response.success) {
        showSuccess('Bank details saved successfully');
        navigation.goBack();
      } else {
        showError('Failed to save bank details. Please try again.');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to save bank details. Please try again.';
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
              Bank Details
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Account Holder Name */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  Account Holder Name<Text style={styles.asterisk}> *</Text>
                </Text>
              </View>
              <TextInput
                style={styles.fieldInput}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="Enter Name"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="words"
              />
            </View>

            {/* Account Number */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  Account Number<Text style={styles.asterisk}> *</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <InfoIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.fieldInput}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter account number"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
              />
            </View>

            {/* IFSC Code */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  IFSC Code<Text style={styles.asterisk}> *</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <InfoIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.fieldInput}
                value={ifscCode}
                onChangeText={(text) => setIfscCode(text.toUpperCase())}
                placeholder="Enter IFSC code"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="characters"
                maxLength={11}
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
              label={loading ? 'Saving...' : 'Save'}
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
                Saving bank details...
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
  fieldContainer: {
    marginBottom: vs(24),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingBottom: vs(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
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
    backgroundColor: colors.background.primary,
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

export default AddBankDetailsScreen;

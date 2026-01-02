/**
 * DashboardHome Screen
 * Main dashboard overview for partners
 *
 * @format
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import LocationIcon from '../../assets/svg/icons/location.svg';
import NotificationIcon from '../../assets/svg/icons/notification.svg';
import DropdownIcon from '../../assets/svg/icons/dropdown.svg';
import { StoreCompletionProgress, VerifyCompletionCard } from '../../components/dashboard';
import TeamVerifyIcon from '../../assets/svg/icons/team_verify.svg';
import ServiceVerifyIcon from '../../assets/svg/icons/service_verify.svg';
import BusinessVerifyIcon from '../../assets/svg/icons/business_verify.svg';
import BankVerifyIcon from '../../assets/svg/icons/bank_verify.svg';
import { vendorService, type VendorData } from '../../services/api/vendor.service';
import { userStorage } from '../../utils/storage';
import { showError } from '../../utils/flashMessage';
import type { DashboardStackScreenProps } from '../../navigation/types';

type DashboardHomeProps = DashboardStackScreenProps<'DashboardHome'>;

const DashboardHome: React.FC<DashboardHomeProps> = ({ navigation }) => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendorData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await userStorage.getUserId();
      
      if (!userId) {
        showError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await vendorService.getVendorByUserId(userId);
      
      if (response.success && response.data) {
        setVendorData(response.data);
      } else {
        showError('Failed to load vendor data');
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vendor data when screen comes into focus (e.g., after navigating back from other screens)
  useFocusEffect(
    useCallback(() => {
      fetchVendorData();
    }, [fetchVendorData])
  );

  // Determine which cards to show based on businessType and field presence
  const isIndividual = vendorData?.businessType === 'Individual';
  const hasStaffField = vendorData?.staff !== undefined; // Check if staff field exists, regardless of items
  const servicesArray = vendorData?.services || []; // Get services array, default to empty array
  const hasServices = servicesArray.length > 0; // Check if services array has items
  // Check if bankDetails exists and has data (can be array or object)
  const bankDetailsData = vendorData?.bankDetails;
  const hasBankDetails = Array.isArray(bankDetailsData) 
    ? bankDetailsData.length > 0 
    : bankDetailsData !== undefined && Object.keys(bankDetailsData).length > 0; // Check if bankDetails object has properties
  const hasBusinessImages = vendorData?.businessImages !== undefined && (vendorData?.businessImages?.length ?? 0) > 0; // Check if businessImages field exists and has items
  const hasBusinessDocument = vendorData?.businessDocument !== undefined && 
    (Array.isArray(vendorData.businessDocument) 
      ? vendorData.businessDocument.length > 0 
      : !!vendorData.businessDocument); // Check if businessDocument exists (can be string or array)
  const isBusinessVerified = hasBusinessImages && hasBusinessDocument; // Both images and documents are required
  const showTeamCard = !isIndividual && !hasStaffField; // Hide team card for Individual or if staff field exists
  const showServicesCard = !hasServices; // Show services card if services array is empty
  const showBankDetailsCard = !hasBankDetails; // Show bank details card if bankDetails array/object is empty
  const showVerifyBusinessCard = !isBusinessVerified; // Show verify business card if business is not verified
  
  // Check if any completion card is visible
  const hasAnyCardVisible = showTeamCard || showServicesCard || showBankDetailsCard || showVerifyBusinessCard;

  // Calculate notification count based on rejection messages
  // Only show notifications if the corresponding data is empty
  const rejectionMessages: Array<{ type: 'service' | 'bank' | 'image' | 'document'; title: string; message: string }> = [];
  
  // Show service rejection only if services array is empty
  if (vendorData?.serviceRejectMessage && !hasServices) {
    rejectionMessages.push({
      type: 'service',
      title: 'Services Rejected',
      message: vendorData.serviceRejectMessage,
    });
  }
  
  // Show bank rejection only if bank details is empty
  if (vendorData?.bankRejectMessage && !hasBankDetails) {
    rejectionMessages.push({
      type: 'bank',
      title: 'Bank Details Rejected',
      message: vendorData.bankRejectMessage,
    });
  }
  
  // Show image rejection only if businessImages is empty
  if (vendorData?.imageRejectMessage && !hasBusinessImages) {
    rejectionMessages.push({
      type: 'image',
      title: 'Business Images Rejected',
      message: vendorData.imageRejectMessage,
    });
  }
  
  // Show document rejection only if businessDocument is empty
  if (vendorData?.documentRejectMessage && !hasBusinessDocument) {
    rejectionMessages.push({
      type: 'document',
      title: 'Business Document Rejected',
      message: vendorData.documentRejectMessage,
    });
  }

  const notificationCount = rejectionMessages.length;

  // Handle notification icon press
  const handleNotificationPress = () => {
    const rootNavigation = navigation.getParent()?.getParent();
    if (rootNavigation) {
      (rootNavigation as any).navigate('Notifications', {
        rejectionMessages,
      });
    }
  };

  // Format location text: "address, city"
  const locationText = vendorData
    ? `${vendorData.address}, ${vendorData.city}`
    : 'Loading...';

  // Get business name from API or fallback
  const businessName = vendorData?.businessName || 'Loading...';

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={styles.headerCard}>
        {/* Top row: location + address, notification */}
        <View style={styles.headerTopRow}>
          <View style={styles.locationRow}>
            <LocationIcon width={hs(14)} height={hs(14)} />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNotificationPress}
            style={styles.notificationBadge}
          >
            <NotificationIcon width={hs(18)} height={hs(18)} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Business name & welcome text */}
        <View style={styles.headerTextBlock}>
          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.welcomeText}>Welcome to your dashboard!</Text>
        </View>

        {/* Date filter pill */}
        <TouchableOpacity activeOpacity={0.8} style={styles.datePill}>
          <Text style={styles.datePillText}>Today</Text>
          <DropdownIcon width={hs(12)} height={hs(12)} />
        </TouchableOpacity>
      </View>

      {/* Store completion progress */}
      <View style={styles.progressSection}>
        {/* Calculate progress: 25% for each completed step (staff, services, bank details, business verification) */}
        {/* Progress is based on card visibility: if card is NOT visible, step is complete */}
        {(() => {
          // Each step is worth 25% (0.25)
          let completedSteps = 0;
          
          // Staff step complete if team card is NOT visible
          if (!showTeamCard) completedSteps += 1;
          
          // Services step complete if services card is NOT visible
          if (!showServicesCard) completedSteps += 1;
          
          // Bank details step complete if bank details card is NOT visible
          if (!showBankDetailsCard) completedSteps += 1;
          
          // Business verification step complete if verify business card is NOT visible (i.e., business is verified)
          if (!showVerifyBusinessCard) completedSteps += 1;
          
          // Calculate progress: completedSteps / 4 (4 total steps)
          const progress = completedSteps / 4;
          
          return (
            <StoreCompletionProgress progress={progress} />
          );
        })()}
        
        {/* Conditionally render team card only for Storefront/Franchise and when staff field doesn't exist */}
        {showTeamCard && (
          <VerifyCompletionCard
            title="Add your team"
            description="Assign staff and manage schedules."
            icon={TeamVerifyIcon}
            style={styles.cardSpacing}
            onPress={() => navigation.getParent()?.getParent()?.navigate('Staffs' as never)}
          />
        )}
        
        {/* Services card - show if services array is empty (active for Individual or when staff field exists) */}
        {showServicesCard && (
          <VerifyCompletionCard
            title="Add your services"
            description="Show what customers can book."
            icon={ServiceVerifyIcon}
            style={styles.cardSpacing}
            disabled={!isIndividual && !hasStaffField}
            onPress={() =>
              navigation
                .getParent()
                ?.getParent()
                ?.navigate('Services' as never)
            }
          />
        )}
        
        {/* Bank details card - show if bankDetails array/object is empty (active when services are complete) */}
        {showBankDetailsCard && (
          <VerifyCompletionCard
            title="Add bank details"
            description="Receive payments seamlessly."
            icon={BankVerifyIcon}
            style={styles.cardSpacing}
            disabled={!hasServices}
            onPress={() =>
              navigation
                .getParent()
                ?.getParent()
                ?.navigate('AddBankDetails' as never)
            }
          />
        )}
        
        {/* Show verify business card if business is not verified */}
        {showVerifyBusinessCard && (
          <VerifyCompletionCard
            title="Verify your business"
            description="Increase trust with customers."
            icon={BusinessVerifyIcon}
            disabled={!hasBankDetails}
            onPress={() =>
              navigation
                .getParent()
                ?.getParent()
                ?.navigate('VerifyBusiness' as never)
            }
          />
        )}
        
        {/* Show Lottie animation only if business is verified AND no cards are visible */}
        {isBusinessVerified && !hasAnyCardVisible && (
          <View style={styles.verifiedSection}>
            <View>
              <View style={styles.lottieContainer}>
                <LottieView
                  source={require('../../assets/lottie/review_period.json')}
                  autoPlay
                  loop={true}
                  style={styles.lottieAnimation}
                />
              </View>
              <Text style={styles.reviewText} numberOfLines={1}>
                Your shop is under review, it may take 2-3 business days.
              </Text>
            </View>
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerTextLine}>Finish setup to</Text>
              <Text style={styles.footerTextLine}>go live.</Text>
              <Text style={styles.footerArrow}>→</Text>
            </View>
          </View>
        )}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    // Slightly smaller side padding to bring header closer to the edges
    paddingHorizontal: hs(12),
    // Add a bit more space from the very top
    paddingTop: vs(24),
  },
  headerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: ms(12),
    paddingHorizontal: hs(12),
    paddingTop: vs(12),
    paddingBottom: vs(14),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Slightly tighter gap before the business name
    marginBottom: vs(6),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
  },
  locationText: {
    ...typography.label,
    color: colors.text.primary,
  },
  notificationBadge: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: '#4D4D4D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -vs(4),
    right: -hs(4),
    backgroundColor: colors.status.error,
    borderRadius: ms(10),
    minWidth: ms(20),
    height: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(4),
    borderWidth: 2,
    borderColor: colors.background.white,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text.white,
    fontSize: ms(10),
    fontWeight: '700',
  },
  headerTextBlock: {
    marginBottom: vs(12),
  },
  businessName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: vs(4),
  },
  welcomeText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  datePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  datePillText: {
    ...typography.label,
    color: colors.text.primary,
  },
  progressSection: {
    // Tighter vertical gap between filter and progress
    marginTop: vs(10),
    paddingHorizontal: hs(12),
  },
  cardSpacing: {
    marginBottom: vs(12),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    width: '100%',
    height: vs(200),
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: vs(16),
    marginLeft: -hs(20),
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  reviewText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'left',
    marginTop: vs(12),
    marginLeft: hs(12),
    marginRight: hs(12),
    width: '100%',
    lineHeight: vs(20),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  verifiedSection: {
    marginTop: vs(16),
    minHeight: vs(500),
  },
  footerTextContainer: {
    marginTop: vs(40),
    marginBottom: vs(20),
    marginLeft: hs(12),
    marginRight: hs(12),
    width: '100%',
  },
  footerTextLine: {
    fontSize: ms(32),
    fontWeight: '700',
    color: '#5E5E5E',
    lineHeight: vs(32),
    letterSpacing: -0.5,
  },
  footerArrow: {
    fontSize: ms(32),
    fontWeight: '700',
    color: '#5E5E5E',
    lineHeight: vs(32),
    marginTop: vs(2),
  },
});

export default DashboardHome;



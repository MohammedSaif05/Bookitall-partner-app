/**
 * DashboardHome Screen
 * Main dashboard overview for partners
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
    const fetchVendorData = async () => {
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
    };

    fetchVendorData();
  }, []);

  // Determine which cards to show based on businessType and staff field presence
  const isIndividual = vendorData?.businessType === 'Individual';
  const hasStaffField = vendorData?.staff !== undefined; // Check if staff field exists, regardless of items
  const hasServicesField = vendorData?.services !== undefined; // Check if services field exists, regardless of items
  const showTeamCard = !isIndividual && !hasStaffField; // Hide team card for Individual or if staff field exists
  const showServicesCard = !hasServicesField; // Hide services card if services field exists

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
      {/* Header card */}
      <View style={styles.headerCard}>
        {/* Top row: location + address, notification */}
        <View style={styles.headerTopRow}>
          <View style={styles.locationRow}>
            <LocationIcon width={hs(14)} height={hs(14)} />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>

          <View style={styles.notificationBadge}>
            <NotificationIcon width={hs(18)} height={hs(18)} />
          </View>
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
        {/* Calculate progress: 25% for staff, 25% for services */}
        <StoreCompletionProgress 
          progress={
            hasStaffField && hasServicesField 
              ? 0.5 
              : hasStaffField 
              ? 0.25 
              : 0
          } 
        />
        
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
        
        {/* Services card - hide if services field exists, otherwise show (active for Individual or when staff field exists) */}
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
        
        <VerifyCompletionCard
          title="Add bank details"
          description="Receive payments seamlessly."
          icon={BankVerifyIcon}
          style={styles.cardSpacing}
          disabled={!hasServicesField}
        />
        
        <VerifyCompletionCard
          title="Verify your business"
          description="Increase trust with customers."
          icon={BusinessVerifyIcon}
          disabled={true}
        />
      </View>
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
});

export default DashboardHome;



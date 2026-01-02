/**
 * NotificationScreen
 * Screen to display rejection messages and notifications
 *
 * @format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import NotificationRejectionIcon from '../../assets/svg/icons/notification_rejection.svg';
import type { RootStackScreenProps } from '../../navigation/types';

type NotificationScreenProps = RootStackScreenProps<'Notifications'>;

interface RejectionItem {
  type: 'service' | 'bank' | 'image' | 'document';
  title: string;
  message: string;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  navigation,
  route,
}) => {
  // Get rejection messages from route params
  const rejectionMessages = route.params?.rejectionMessages || [];

  // If no rejection messages, show empty state
  if (rejectionMessages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackIcon width={hs(24)} height={vs(24)} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>
            You're all caught up! No rejection messages at the moment.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon width={hs(24)} height={vs(24)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rejectionMessages.map((item: RejectionItem, index: number) => (
          <View key={index} style={styles.notificationCard}>
            {/* Content */}
            <View style={styles.notificationContent}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <NotificationRejectionIcon 
                  width={ms(20)} 
                  height={ms(20)} 
                  stroke={colors.text.primary}
                  fill={colors.text.primary}
                />
              </View>
              
              {/* Text content */}
              <View style={styles.textContainer}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
              </View>
              
              {/* Retry button */}
              <TouchableOpacity 
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() => {
                  // Handle retry action - navigate to appropriate screen based on type
                  if (item.type === 'service') {
                    navigation.getParent()?.getParent()?.navigate('Services' as never);
                  } else if (item.type === 'bank') {
                    navigation.getParent()?.getParent()?.navigate('AddBankDetails' as never);
                  } else if (item.type === 'image' || item.type === 'document') {
                    navigation.getParent()?.getParent()?.navigate('VerifyBusiness' as never);
                  }
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: vs(4),
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  placeholder: {
    width: hs(32),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: hs(20),
    paddingTop: vs(20),
  },
  notificationCard: {
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: colors.border.light,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
  },
  iconContainer: {
    marginRight: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: hs(12),
  },
  notificationTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(2),
    fontSize: ms(16),
  },
  notificationMessage: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: ms(14),
    lineHeight: vs(18),
  },
  retryButton: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    borderRadius: ms(8),
    minWidth: hs(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: ms(14),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(40),
  },
  emptyText: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: vs(8),
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default NotificationScreen;


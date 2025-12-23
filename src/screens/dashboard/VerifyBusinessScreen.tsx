/**
 * VerifyBusinessScreen
 * Screen for uploading shop documents and images
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Image,
  ScrollView,
  PermissionsAndroid,
  Alert,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import UploadDocumentIcon from '../../assets/svg/icons/upload_document.svg';
import { OnboardingCTAButton } from '../../components/onboarding';
import type { CustomAxiosError } from '../../services/api';
import { userStorage } from '../../utils/storage';
import { showError, showSuccess } from '../../utils/flashMessage';
import type { RootStackScreenProps } from '../../navigation/types';

type VerifyBusinessScreenProps = RootStackScreenProps<'VerifyBusiness'>;

interface DocumentFile {
  uri: string;
  name: string;
}

const VerifyBusinessScreen: React.FC<VerifyBusinessScreenProps> = ({ navigation }) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]); // Array of document files with name and URI
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]); // Up to 2 gallery images
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  const MAX_GALLERY_IMAGES = 2;

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to upload files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by the picker
    return true;
  };

  const handleDocumentUpload = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      
      if (!hasPermission && Platform.OS === 'android') {
        Alert.alert(
          'Permission Required',
          'Please grant storage access permission to upload documents.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Use document picker for PDF files
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      if (result && result.length > 0) {
        const newDocuments: DocumentFile[] = result.map(doc => ({
          uri: doc.uri,
          name: doc.name || `Document ${documents.length + 1}.pdf`,
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error: any) {
      // User cancelled the picker
      if (DocumentPicker.isCancel(error)) {
        return;
      }
      
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to open document picker. Please try again.');
    }
  };

  const handlePrimaryImageUpload = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      
      if (!hasPermission && Platform.OS === 'android') {
        Alert.alert(
          'Permission Required',
          'Please grant photo access permission to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          selectionLimit: MAX_GALLERY_IMAGES + 1, // Allow primary + gallery images
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            return;
          }

          if (response.errorMessage) {
            Alert.alert('Error', response.errorMessage);
            return;
          }

          if (response.assets && response.assets.length > 0) {
            const uris = response.assets
              .map(asset => asset.uri)
              .filter((uri): uri is string => !!uri);
            
            if (uris.length > 0) {
              // First image is primary, rest are gallery
              setPrimaryImage(uris[0]);
              
              // Add remaining images to gallery (up to MAX_GALLERY_IMAGES)
              const remainingImages = uris.slice(1).slice(0, MAX_GALLERY_IMAGES);
              if (remainingImages.length > 0) {
                setGalleryImages(remainingImages);
              }
            }
          }
        }
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };


  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId) {
      showError('User ID not found. Please login again.');
      return;
    }

    // Validate that at least documents or images are uploaded
    if (documents.length === 0 && !primaryImage) {
      showError('Please upload at least documents or primary image');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Call API to upload documents and images
      // For now, just show success message
      // When API is ready, uncomment below:
      // const response = await vendorService.verifyBusiness(userId, {
      //   documents: documents,
      //   primaryImage: primaryImage,
      //   galleryImages: galleryImages,
      // });
      // if (response.success) {
      //   showSuccess('Business verification details saved successfully');
      //   navigation.goBack();
      // } else {
      //   showError('Failed to save verification details. Please try again.');
      // }

      // Temporary success message for now
      showSuccess('Business verification details saved successfully');
      navigation.goBack();
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to save verification details. Please try again.';
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
              Shop Details
            </Text>
          </View>

          {/* Main Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Documents Section */}
            <View style={styles.sectionNoMargin}>
              <Text style={styles.sectionTitle}>Documents</Text>
              <Text style={styles.sectionDescription}>
                Upload Legal documents of your shop (must include shop name and Owner details)
              </Text>
              
              {/* Documents Upload Area */}
              <TouchableOpacity
                style={styles.imageUploadArea}
                activeOpacity={0.8}
                onPress={handleDocumentUpload}
              >
                <View style={styles.imageUploadContent}>
                  <View style={styles.uploadIconContainer}>
                    <UploadDocumentIcon width={hs(48)} height={vs(48)} />
                  </View>
                  <Text style={styles.uploadText}>Upload Documents</Text>
                  <Text style={styles.uploadHint}>Accepted format: PDF</Text>
                </View>
              </TouchableOpacity>

              {/* Display uploaded documents */}
              {documents.length > 0 && (
                <View style={styles.uploadedFilesContainer}>
                  {documents.map((doc, index) => (
                    <View key={index} style={styles.uploadedFileItem}>
                      <Text style={styles.uploadedFileName} numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Images Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
              <Text style={styles.sectionDescription}>
                Upload primary image and add up to {MAX_GALLERY_IMAGES} gallery images
              </Text>
              
              {/* Primary Image Upload */}
              <TouchableOpacity
                style={styles.imageUploadArea}
                activeOpacity={0.8}
                onPress={handlePrimaryImageUpload}
              >
                {primaryImage ? (
                  <Image
                    source={{ uri: primaryImage }}
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imageUploadContent}>
                    <View style={styles.uploadIconContainer}>
                      <UploadDocumentIcon width={hs(48)} height={vs(48)} />
                    </View>
                    <Text style={styles.uploadText}>Upload Images</Text>
                    <Text style={styles.uploadHint}>
                      Clear images help customers trust your shop
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Gallery Images */}
              {galleryImages.length > 0 && (
                <View style={styles.galleryContainer}>
                  <Text style={styles.galleryTitle}>Gallery Images</Text>
                  <View style={styles.galleryGrid}>
                    {galleryImages.map((imageUri, index) => (
                      <View key={index} style={styles.galleryItem}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.galleryImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.galleryRemoveButton}
                          onPress={() => removeGalleryImage(index)}
                        >
                          <Text style={styles.galleryRemoveText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

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
              disabled={loading}
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
                Saving shop details...
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: hs(16),
    paddingTop: vs(24),
    paddingBottom: vs(24),
  },
  section: {
    marginBottom: vs(24),
  },
  sectionNoMargin: {
    marginBottom: 0,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(8),
  },
  sectionDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: vs(16),
    lineHeight: vs(20),
  },
  imageUploadArea: {
    width: '100%',
    minHeight: vs(200),
    borderRadius: ms(12),
    backgroundColor: 'transparent',
    borderWidth: ms(1.5),
    borderColor: colors.border.dark,
    marginBottom: vs(20),
    overflow: 'hidden',
  },
  imageUploadContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(40),
    paddingHorizontal: hs(20),
  },
  uploadIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  uploadText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: vs(8),
    fontWeight: '600',
  },
  uploadHint: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: vs(200),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.medium,
    marginTop: 0,
    marginBottom: vs(20),
  },
  uploadedFilesContainer: {
    marginTop: vs(12),
  },
  uploadedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: ms(8),
    padding: vs(12),
    marginBottom: vs(8),
  },
  uploadedFileName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: hs(12),
  },
  removeButton: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(4),
  },
  removeButtonText: {
    ...typography.body,
    color: '#FF3B30',
    fontWeight: '600',
  },
  galleryContainer: {
    marginTop: vs(16),
  },
  galleryTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: vs(12),
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(12),
  },
  galleryItem: {
    width: (Dimensions.get('window').width - hs(16) * 2 - hs(12)) / 2,
    height: vs(120),
    borderRadius: ms(8),
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryRemoveButton: {
    position: 'absolute',
    top: vs(4),
    right: hs(4),
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryRemoveText: {
    color: colors.background.white,
    fontSize: ms(18),
    fontWeight: '700',
    lineHeight: ms(20),
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: hs(16),
    paddingBottom: vs(32),
    paddingTop: vs(12),
    gap: hs(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.medium,
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

export default VerifyBusinessScreen;

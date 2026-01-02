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
import { pick } from '@react-native-documents/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import UploadDocumentIcon from '../../assets/svg/icons/upload_document.svg';
import { OnboardingCTAButton } from '../../components/onboarding';
import { vendorService, type VendorData } from '../../services/api/vendor.service';
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
  const [fetchingData, setFetchingData] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const MAX_GALLERY_IMAGES = 1; // Maximum 1 gallery image (total 2 images: 1 primary + 1 gallery)

  // Fetch and preload existing images and documents
  const fetchExistingData = async (id: string) => {
    try {
      setFetchingData(true);
      const response = await vendorService.getVendorByUserId(id);
      
      if (response.success && response.data) {
        const vendorData: VendorData = response.data;
        
        // Preload business images
        if (vendorData.businessImages && vendorData.businessImages.length > 0) {
          const images = vendorData.businessImages;
          // First image is primary, rest are gallery
          setPrimaryImage(images[0]);
          if (images.length > 1) {
            setGalleryImages(images.slice(1).slice(0, MAX_GALLERY_IMAGES));
          }
        }
        
        // Preload business documents
        if (vendorData.businessDocument) {
          // businessDocument can be string or array
          const documentUrls = Array.isArray(vendorData.businessDocument)
            ? vendorData.businessDocument
            : [vendorData.businessDocument];
          
          const documentFiles: DocumentFile[] = documentUrls.map((url, index) => ({
            uri: url,
            name: `Document ${index + 1}.pdf`,
          }));
          
          setDocuments(documentFiles);
        }
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      // Don't show error to user, just continue without preloading
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
      if (id) {
        await fetchExistingData(id);
      }
    };
    loadUserId();
  }, []);

  // Request storage permission for documents (Android)
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), document picker uses system file picker
        // which doesn't require READ_EXTERNAL_STORAGE permission
        if (Platform.Version >= 33) {
          // No permission needed for Android 13+ document picker
          return true;
        }
        
        // For Android < 13, check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        
        if (checkResult) {
          return true;
        }
        
        // Request permission if not granted
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to upload documents.',
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
    // iOS permissions are handled automatically by the document picker
    return true;
  };

  // Request photo permission for images (Android)
  const requestPhotoPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          // Check if permission is already granted
          const checkResult = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
          
          if (checkResult) {
            return true;
          }
          
          // Request permission if not granted
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Photo Permission',
              message: 'This app needs access to your photos to upload images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For Android < 13, use READ_EXTERNAL_STORAGE
          // Check if permission is already granted
          const checkResult = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          
          if (checkResult) {
            return true;
          }
          
          // Request permission if not granted
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to your storage to upload images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Photo permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by the image picker
    return true;
  };

  const handleDocumentUpload = async () => {
    try {
      // Request permission first (only needed for Android < 13)
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const hasPermission = await requestStoragePermission();
        
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please grant storage access permission to upload documents. You can enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  // On Android, we can't directly open settings, but user can do it manually
                  // The permission dialog should have appeared
                }
              }
            ]
          );
          return;
        }
      }

      // Use document picker for PDF files
      // For Android 13+ and iOS, no permission needed - system handles it
      const result = await pick({
        type: ['application/pdf'],
        allowMultiSelection: true,
      });

      if (result && result.length > 0) {
        const newDocuments: DocumentFile[] = result.map((doc: any) => ({
          uri: doc.uri,
          name: doc.name || `Document ${documents.length + 1}.pdf`,
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error: any) {
      // User cancelled the picker
      if (error?.code === 'DOCUMENT_PICKER_CANCELED' || error?.message?.includes('cancel')) {
        return;
      }
      
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to open document picker. Please try again.');
    }
  };

  const handlePrimaryImageUpload = async () => {
    try {
      // Request permission first
      const hasPermission = await requestPhotoPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant photo access permission to upload images. You can enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'OK', 
              onPress: () => {
                // User can manually grant permission and try again
              }
            }
          ]
        );
        return;
      }

      // Calculate how many images can still be selected
      const currentImageCount = (primaryImage ? 1 : 0) + galleryImages.length;
      const maxTotalImages = 2; // Maximum 2 images total (1 primary + 1 gallery)
      const remainingSlots = maxTotalImages - currentImageCount;
      
      if (remainingSlots <= 0) {
        Alert.alert(
          'Limit Reached',
          'You can only upload up to 2 images total (1 primary + 1 gallery).'
        );
        return;
      }

      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          selectionLimit: remainingSlots, // Allow only remaining slots
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
              if (primaryImage) {
                // If primary image already exists, add all selected images to gallery
                const availableSlots = MAX_GALLERY_IMAGES - galleryImages.length;
                const imagesToAdd = uris.slice(0, availableSlots);
                if (imagesToAdd.length > 0) {
                  setGalleryImages(prev => [...prev, ...imagesToAdd]);
                } else {
                  Alert.alert(
                    'Limit Reached',
                    `You can only upload up to ${MAX_GALLERY_IMAGES} gallery images.`
                  );
                }
              } else {
                // No primary image yet, first image becomes primary, rest go to gallery
                setPrimaryImage(uris[0]);
                
                // Add remaining images to gallery (up to MAX_GALLERY_IMAGES)
                const remainingImages = uris.slice(1).slice(0, MAX_GALLERY_IMAGES);
                if (remainingImages.length > 0) {
                  setGalleryImages(remainingImages);
                }
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

  // Check if save button should be enabled - both documents and images are mandatory
  const isSaveEnabled = documents.length > 0 && primaryImage !== null;

  const handleSave = async () => {
    if (!userId) {
      showError('User ID not found. Please login again.');
      return;
    }

    // Validate that both documents and images are uploaded (both are mandatory)
    if (documents.length === 0) {
      showError('Please upload at least one document');
      return;
    }
    
    if (!primaryImage) {
      showError('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);
      
      // Upload documents
      const documentUris = documents.map(doc => doc.uri);
      const documentsResponse = await vendorService.uploadBusinessDocuments(
        userId,
        documentUris
      );

      if (!documentsResponse.success) {
        showError('Failed to upload documents. Please try again.');
        return;
      }

      // Upload images
      const imagesResponse = await vendorService.uploadBusinessImages(
        userId,
        primaryImage,
        galleryImages
      );

      if (!imagesResponse.success) {
        showError('Failed to upload images. Please try again.');
        return;
      }

      showSuccess('Business verification details saved successfully');
      navigation.goBack();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to save verification details. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Show loading while fetching existing data
  if (fetchingData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={styles.loadingText}>Loading shop details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                style={documents.length > 0 ? styles.imageUploadAreaSmall : styles.imageUploadArea}
                activeOpacity={0.8}
                onPress={handleDocumentUpload}
              >
                {documents.length > 0 ? (
                  <View style={styles.documentsListContainer}>
                    {documents.map((doc, index) => (
                      <View key={index} style={styles.uploadedFileItem}>
                        <Text style={styles.uploadedFileName} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            setDocuments(prev => prev.filter((_, i) => i !== index));
                          }}
                          style={styles.removeButton}
                        >
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.imageUploadContent}>
                    <View style={styles.uploadIconContainer}>
                      <UploadDocumentIcon width={hs(48)} height={vs(48)} />
                    </View>
                    <Text style={styles.uploadText}>Upload Documents</Text>
                    <Text style={styles.uploadHint}>Accepted format: PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Images Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
              <Text style={styles.sectionDescription}>
                Upload primary image and add up to {MAX_GALLERY_IMAGES} gallery images
              </Text>
              
              {/* Gallery Images - Show primary + gallery images */}
              {(primaryImage || galleryImages.length > 0) && (
                <View style={styles.galleryContainer}>
                  <Text style={styles.galleryTitle}>Gallery Images</Text>
                  <View style={styles.galleryGrid}>
                    {/* Show primary image first */}
                    {primaryImage && (
                      <View style={styles.galleryItem}>
                        <Image
                          source={{ uri: primaryImage }}
                          style={styles.galleryImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.galleryRemoveButton}
                          onPress={() => setPrimaryImage(null)}
                        >
                          <Text style={styles.galleryRemoveText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {/* Show gallery images */}
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

              {/* Primary Image Upload - Hide if 2 images selected (primary + 1 gallery) */}
              {(primaryImage && galleryImages.length >= 1) ? null : (
                <TouchableOpacity
                  style={styles.imageUploadArea}
                  activeOpacity={0.8}
                  onPress={handlePrimaryImageUpload}
                >
                  <View style={styles.imageUploadContent}>
                    <View style={styles.uploadIconContainer}>
                      <UploadDocumentIcon width={hs(48)} height={vs(48)} />
                    </View>
                    <Text style={styles.uploadText}>Upload Images</Text>
                    <Text style={styles.uploadHint}>
                      Clear images help customers trust your shop
                    </Text>
                  </View>
                </TouchableOpacity>
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
              disabled={loading || !isSaveEnabled}
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
  imageUploadAreaSmall: {
    width: '100%',
    minHeight: vs(100),
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.medium,
    marginTop: 0,
    marginBottom: vs(20),
  },
  documentsListContainer: {
    padding: vs(12),
    width: '100%',
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
    marginTop: vs(24),
    marginBottom: vs(16),
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});

export default VerifyBusinessScreen;

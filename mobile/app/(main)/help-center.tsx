import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  category: 'account' | 'payment' | 'security';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: '1',
    category: 'account',
    question: 'How do I change my Transaction PIN?',
    answer: 'Go to the Profile screen and tap "Transaction PIN". You can disable it or choose "Change PIN". Enter your current PIN first, then set your new 6-digit PIN.'
  },
  {
    id: '2',
    category: 'account',
    question: 'How do I update my profile details?',
    answer: 'Tap the arrow next to your name and email on the Profile screen to access the Edit Profile page. There, you can update your display name, email, and password.'
  },
  {
    id: '3',
    category: 'payment',
    question: 'How do I make a payment using QR code?',
    answer: 'Tap the sliding gradient "Scan QR" button in the middle of the bottom navigation bar. Point your camera at any supported merchant QR code, verify the merchant details, enter the amount, and authorize the transaction with your PIN.'
  },
  {
    id: '4',
    category: 'payment',
    question: 'Are there any transaction or transfer limits?',
    answer: 'Yes. For security purposes, standard verified accounts have a daily transfer limit of $10,000. If you require higher limits, please contact support.'
  },
  {
    id: '5',
    category: 'security',
    question: 'Why was I logged out of my account automatically?',
    answer: 'For your security, MistyPay automatically ends your session after 20 minutes of inactivity or if the app remains in the background. This prevents unauthorized access to your funds if your device is unattended.'
  },
  {
    id: '6',
    category: 'security',
    question: 'How does MistyPay keep my funds and data safe?',
    answer: "MistyPay uses industry-grade end-to-end encryption for all API traffic, secures transaction authorization with a hardware-backed 6-digit PIN, and stores credentials in your device's SecureStore sandbox."
  }
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'account' | 'payment' | 'security'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = (type: 'chat' | 'phone' | 'email') => {
    if (type === 'chat') {
      Alert.alert('Live Chat', 'Connecting you to support agent...', [{ text: 'OK' }]);
    } else if (type === 'phone') {
      Linking.openURL('tel:+18001234567').catch(() => {
        Alert.alert('Error', 'Unable to initiate phone call. Call +1 (800) 123-4567.');
      });
    } else if (type === 'email') {
      Linking.openURL('mailto:support@mistypay.com?subject=MistyPay Support Request').catch(() => {
        Alert.alert('Error', 'Unable to open email client. Email us at support@mistypay.com.');
      });
    }
  };

  const filteredFAQs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} stroke="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} stroke="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search FAQs, topics, guidelines..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {(['all', 'account', 'payment', 'security'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                selectedCategory === cat && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === cat && styles.categoryTabTextActive
              ]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQs Accordion */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity 
                  style={styles.faqHeader} 
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(faq.id)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={20} stroke="#64748B" />
                  ) : (
                    <ChevronDown size={20} stroke="#64748B" />
                  )}
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <HelpCircle size={48} stroke="#94A3B8" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyStateText}>No results match your search query.</Text>
          </View>
        )}

        {/* Contact Section */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Still Need Help?</Text>
        <Text style={styles.contactSubtitle}>Get in touch with our security & customer service team.</Text>

        <View style={styles.contactContainer}>
          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.7}
            onPress={() => handleContactSupport('chat')}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: '#DBEAFE' }]}>
              <MessageSquare size={24} stroke="#2563EB" />
            </View>
            <Text style={styles.contactTitle}>Live Chat</Text>
            <Text style={styles.contactDesc}>Chat with agents 24/7</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.7}
            onPress={() => handleContactSupport('phone')}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Phone size={24} stroke="#16A34A" />
            </View>
            <Text style={styles.contactTitle}>Hotline</Text>
            <Text style={styles.contactDesc}>Free 1800 Hotline</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.7}
            onPress={() => handleContactSupport('email')}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Mail size={24} stroke="#EF4444" />
            </View>
            <Text style={styles.contactTitle}>Email Us</Text>
            <Text style={styles.contactDesc}>Response within 24h</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    paddingRight: 12,
    lineHeight: 20,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  contactDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
});

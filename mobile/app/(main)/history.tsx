import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, CreditCard } from 'lucide-react-native';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Payment History</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} stroke="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search payments"
            placeholderTextColor="#94A3B8"
            editable={false} // Placeholder for MVP
          />
        </View>

        {/* Empty state transactions list */}
        <View style={styles.emptyContainer}>
          <CreditCard size={48} stroke="#94A3B8" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No payments found</Text>
          <Text style={styles.emptySubtitle}>
            Your past travel transaction summaries will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 56,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ArticleDetailPage = ({ route }) => {
  const { article } = route.params;
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Icon name="article" size={30} color="#333" />
        <Text style={styles.title}>{article.title}</Text>
      </View>

      {article.imageUrl ? (
        <View style={styles.imageFrame}>
          <Image source={{ uri: article.imageUrl }} style={styles.image} />
        </View>
      ) : (
        <View style={styles.placeholderImageContainer}>
          <Icon name="image" size={80} color="#aaa" />
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          <Icon name="description" size={24} color="#333" />
          <Text style={styles.contentTitle}>Article Content</Text>
        </View>

        <Text
          style={styles.content}
          numberOfLines={showFullContent ? undefined : 6}
        >
          {article.content}
        </Text>

        {!showFullContent && article.content.length > 200 && (
          <TouchableOpacity onPress={() => setShowFullContent(true)}>
            <Text style={styles.readMoreButton}>Read More</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#B0D0D3', // Full screen background color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  imageFrame: {
    borderWidth: 2,
    borderColor: '#969494ef',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  placeholderImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  readMoreButton: {
    color: '#1e90ff',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default ArticleDetailPage;

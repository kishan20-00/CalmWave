import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const ArticleDetailPage = ({ route }) => {
  const { article } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{article.title}</Text>
      {article.imageUrl && <Image source={{ uri: article.imageUrl }} style={styles.image} />}
      <Text style={styles.content}>{article.content}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  content: {
    fontSize: 16,
    color: '#333',
  },
});

export default ArticleDetailPage;

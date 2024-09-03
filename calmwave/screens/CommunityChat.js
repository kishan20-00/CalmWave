import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, TouchableHighlight } from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';

const defaultCommunityImage = require('../assets/defcomimg.png'); // Default image for communities
const defaultProfileImage = require('../assets/profile.jpg'); // Default image for users
const chatWallpaper = require('../assets/chatBackground.jpg'); // Wallpaper for chat environment

const CommunityChat = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch channels from Firestore
  useEffect(() => {
    const fetchChannels = () => {
      const channelsRef = collection(firestore, 'channels');
      const unsubscribe = onSnapshot(channelsRef, (querySnapshot) => {
        const channelList = [];
        querySnapshot.forEach((doc) => {
          channelList.push({ id: doc.id, ...doc.data() });
        });
        setChannels(channelList);
        setLoading(false);
      });
      return () => unsubscribe();
    };

    fetchChannels();
  }, []);

  // Fetch messages when a channel is selected
  useEffect(() => {
    if (selectedChannel) {
      setLoading(true);
      const fetchMessages = () => {
        const messagesRef = collection(firestore, 'channels', selectedChannel.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesList = [];
          querySnapshot.forEach((doc) => {
            messagesList.push({ id: doc.id, ...doc.data() });
          });
          setMessages(messagesList);
          setLoading(false);
        });
        return () => unsubscribe();
      };

      fetchMessages();
    }
  }, [selectedChannel]);

  const handleSend = async () => {
    if (message.trim() && selectedChannel) {
      setLoading(true);
      try {
        const messagesRef = collection(firestore, 'channels', selectedChannel.id, 'messages');
        await addDoc(messagesRef, {
          text: message,
          timestamp: new Date(),
          user: auth.currentUser.email,
        });
        setMessage('');
      } catch (error) {
        console.error('Error adding message: ', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateChannel = async () => {
    if (newChannelName.trim()) {
      setLoading(true);
      try {
        await addDoc(collection(firestore, 'channels'), {
          name: newChannelName,
          image: defaultCommunityImage, // Attach default image
        });
        setNewChannelName('');
      } catch (error) {
        console.error('Error creating channel: ', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Channel creation */}
      <View style={styles.newChannelContainer}>
        <TextInput
          style={styles.channelInput}
          value={newChannelName}
          onChangeText={setNewChannelName}
          placeholder="Create new channel"
        />
        <TouchableOpacity style={styles.createChannelButton} onPress={handleCreateChannel}>
          <Text style={styles.createChannelText}>Create Channel</Text>
        </TouchableOpacity>
      </View>

      {/* Channel list */}
      <Text style={styles.sectionTitle}>Communities 👥 :</Text>
      <ScrollView style={styles.channelList}>
        {channels.map((channel) => (
          <TouchableOpacity
            key={channel.id}
            onPress={() => setSelectedChannel(channel)}
            style={[
              styles.channelItem,
              selectedChannel?.id === channel.id && styles.selectedChannelItem,
            ]}
          >
            <Image source={defaultCommunityImage} style={styles.communityImage} />
            <Text style={styles.channelText}>#{channel.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat environment */}
      {selectedChannel && (
        <>
          <Text style={styles.sectionTitle}>Chat Environment 👋 :</Text>
          <View style={styles.chatContainer}>
            <Image source={chatWallpaper} style={styles.wallpaper} />
            <ScrollView style={styles.chatScroll}>
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    msg.user === auth.currentUser.email ? styles.userMessageContainer : styles.otherMessageContainer,
                  ]}
                >
                  <View style={styles.messageInfo}>
                    <Image source={defaultProfileImage} style={styles.profileImage} />
                    <Text style={styles.username}>@{msg.user.split('@')[0]}</Text>
                  </View>
                  <View
                    style={[
                      styles.messageBubble,
                      msg.user === auth.currentUser.email ? styles.userMessageBubble : styles.otherMessageBubble,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
              />
              <TouchableHighlight onPress={handleSend} underlayColor="#DDDDDD" style={styles.sendButton}>
                <Text style={styles.sendText}>👉</Text>
              </TouchableHighlight>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#B0D0D3', // Light background color
  },
  newChannelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#fff', // White background for input
  },
  createChannelButton: {
    backgroundColor: '#0e5280', // Blue button color
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  createChannelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2c3e50',
    borderTopWidth: 1,        // Add 1px top border
    borderTopColor: '#969393',    // Set border color to #333
    paddingTop: 10,             // Add padding to separate the text from the border
  },
  channelList: {
    flex: 1,
    marginBottom: 10,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedChannelItem: {
    backgroundColor: '#e2e0e0',
    borderWidth: 1,
    borderColor: '#a39f9f',
  },
  communityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  channelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 2,
    position: 'relative',
  },
  wallpaper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    resizeMode: 'cover',
    opacity: 0.6,
  },
  chatScroll: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20, // Space for input container
  },
  messageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '75%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderTopLeftRadius: 2,
  },
  userMessageBubble: {
    backgroundColor: '#d0f0c0', // Light green for user messages
  },
  otherMessageBubble: {
    backgroundColor: '#f0f8ff', // Light blue for other messages
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  username: {
    fontSize: 12,
    color: '#0e5280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    backgroundColor:'#ffffff6b',
    marginBottom: 50,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff', // White background for input
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#109e95', // Green button color
  },
  sendText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default CommunityChat;

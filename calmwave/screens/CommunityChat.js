import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';

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
          style={styles.input}
          value={newChannelName}
          onChangeText={setNewChannelName}
          placeholder="Create new channel"
        />
        <Button title="Create Channel" onPress={handleCreateChannel} />
      </View>

      {/* Channel list */}
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
            <Text style={styles.channelText}>#{channel.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages display */}
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.message, msg.user === auth.currentUser.email ? styles.userMessage : styles.otherMessage]}
          >
            <Text style={styles.username}>{msg.user}</Text>
            <Text>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Message input */}
      {selectedChannel && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 70,
  },
  newChannelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  channelList: {
    flex: 1,
    marginBottom: 10,
  },
  channelItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  selectedChannelItem: {
    backgroundColor: '#aaa',
  },
  channelText: {
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f7d6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
});

export default CommunityChat;

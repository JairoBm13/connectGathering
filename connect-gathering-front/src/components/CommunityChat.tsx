import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Send, MessageCircle, Users, Clock } from 'lucide-react';

// Mock chat messages
const MOCK_MESSAGES = [
  {
    id: '1',
    user: 'Alex Chen',
    avatar: 'AC',
    message: 'Hey everyone! Excited about the photo walk this weekend 📸',
    timestamp: '2024-10-10T14:30:00Z',
    isOnline: true
  },
  {
    id: '2',
    user: 'Sarah Johnson',
    avatar: 'SJ',
    message: 'Same here! What time should we meet at the bridge?',
    timestamp: '2024-10-10T14:32:00Z',
    isOnline: true
  },
  {
    id: '3',
    user: 'Mike Rodriguez',
    avatar: 'MR',
    message: 'I suggest 6:30 AM for the golden hour lighting',
    timestamp: '2024-10-10T14:35:00Z',
    isOnline: false
  },
  {
    id: '4',
    user: 'You',
    avatar: 'YO',
    message: 'Perfect! Should we bring any specific equipment?',
    timestamp: '2024-10-10T14:40:00Z',
    isOnline: true
  },
  {
    id: '5',
    user: 'Alex Chen',
    avatar: 'AC',
    message: 'Tripods would be great for some long exposure shots. I can bring extras if needed',
    timestamp: '2024-10-10T14:42:00Z',
    isOnline: true
  }
];

const ONLINE_MEMBERS = [
  { name: 'Alex Chen', avatar: 'AC', status: 'organizing events' },
  { name: 'Sarah Johnson', avatar: 'SJ', status: 'active' },
  { name: 'Emma Wilson', avatar: 'EW', status: 'active' },
  { name: 'David Park', avatar: 'DP', status: 'planning hike' },
  { name: 'You', avatar: 'YO', status: 'active' }
];

function CommunityChat({ community, user }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'YO',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isOnline: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Great point!',
        'I agree with that',
        'Thanks for sharing!',
        'That sounds perfect',
        'Count me in!'
      ];
      const response = {
        id: Date.now().toString() + '1',
        user: 'Alex Chen',
        avatar: 'AC',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        isOnline: true
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const dateKey = formatDate(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Main Chat */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5" />
                <div>
                  <h3>Community Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    {ONLINE_MEMBERS.length} members online
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                General
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {Object.entries(messageGroups).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {date}
                    </div>
                  </div>
                  
                  {dateMessages.map((message, index) => {
                    const isCurrentUser = message.user === 'You';
                    const showAvatar = index === 0 || dateMessages[index - 1]?.user !== message.user;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar className="h-8 w-8">
                                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs">
                                  {message.avatar}
                                </div>
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : ''}`}>
                          {showAvatar && !isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{message.user}</span>
                              {message.isOnline && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                          )}
                          
                          <div
                            className={`p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        {isCurrentUser && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar className="h-8 w-8">
                                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs">
                                  {message.avatar}
                                </div>
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs">
                      AC
                    </div>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Online Members Sidebar */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Online Now</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {ONLINE_MEMBERS.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {ONLINE_MEMBERS.map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <div className="bg-secondary text-secondary-foreground h-full w-full flex items-center justify-center text-xs">
                        {member.avatar}
                      </div>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {member.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {member.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Chat Guidelines</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Keep discussions relevant to community events and activities</p>
              <p>• Be respectful and inclusive to all members</p>
              <p>• Use @mentions to get someone's attention</p>
              <p>• Share photos and updates from events!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CommunityChat
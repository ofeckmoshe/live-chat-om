import React from 'react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions'
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends React.Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMesaggesRef:firebase.database().ref('privateMessges'),
        messagesRef: firebase.database().ref('messages'),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: []
    }

    componentDidMount() {
        const { channel, user } = this.state;
        if(channel && user) {
            this.addListeners(channel.id);
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if(this.messagesEnd){
            this.scrollToBottom();
        }
    };

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    };

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
    };

    addMessageListener = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        })
    };

    getMessagesRef = () => {
        const { messagesRef, privateMesaggesRef, privateChannel} = this.state;
        return privateChannel ? privateMesaggesRef : messagesRef;
    };

    handleSearchChange = event => {
        this.setState(
          {
            searchTerm: event.target.value,
            searchLoading: true
          },
          () => this.handleSearchMessages()
        );
      };

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");
        const searchResults = channelMessages.reduce((acc, message) => {
          if (
            (message.content && message.content.match(regex)) ||
            message.user.name.match(regex)
          ) {
            acc.push(message);
          }
          return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() => this.setState({ searchLoading: false }), 1000);
      };

    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, messages) => {
            if(!acc.includes(messages.user.name)){
                acc.push(messages.user.name);
            }
            return acc;
        }, []);
        
        const numUniqueUsers = `${messages.length} message${messages.length > 1 ? 's' : ''}
                                from ${uniqueUsers.length} user${uniqueUsers.length > 1 ? 's' : ''}`;
        this.setState({ numUniqueUsers })
    };
    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                avatar: message.user.avatar,
                count: 1
                };
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
      };
    
    displayMessages = messages =>
        messages.length > 0 &&
        messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
    ));

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel? '@' : '#'}${channel.name}`:
        '';
    };

    render() {
        const { messagesRef, messages, channel, user, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel } = this.state;

        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                />

                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResults) :
                        this.displayMessages(messages)}
                        <div ref={node => (this.messagesEnd = node)}></div>
                    </Comment.Group>
                </Segment>

                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        );
    };
};

export default connect(null, { setUserPosts })(Messages);
import React from 'react';

const ChatBubble = ({ onClick, isOpen }) => {
    return (
        <button
            onClick={onClick}
            className="chat-bubble"
            title={isOpen ? "Đóng chat" : "Mở chat"}
        >
            {isOpen ? '✕' : '💬'}
        </button>
    );
};

export default ChatBubble;

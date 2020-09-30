import React, { useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
import { socket } from "./socket";
import { useSelector } from "react-redux";

export default function Chat() {
    const elemRef = useRef();
    const chatMessages = useSelector((state) => state && state.msgs);

    useEffect(() => {
        elemRef.current.scrollTop =
            elemRef.current.scrollHeight - elemRef.current.clientHeight;
    }, [chatMessages]);

    const keyCheck = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            socket.emit("chat message", e.target.value);
            e.target.value = "";
        }
    };

    return (
        <div className="chat-main-container">
            <p>Chat</p>
            <div className="chat-messages-container" ref={elemRef}>
                {chatMessages &&
                    chatMessages.map((message, idx) => {
                        return (
                            <div className="message-container" key={idx}>
                                <div className="message-pic">
                                    <img
                                        className="profile-pic"
                                        alt={`${message.first} ${message.last}`}
                                        src={message.url}
                                    />
                                </div>
                                <div className="message">
                                    <p>
                                        {message.first} {message.last}
                                    </p>
                                    <p>{message.message}</p>
                                </div>
                            </div>
                        );
                    })}
            </div>
            <textarea
                rows="5"
                cols="50"
                placeholder="Add your message here"
                onKeyDown={keyCheck}
            ></textarea>
        </div>
    );
}

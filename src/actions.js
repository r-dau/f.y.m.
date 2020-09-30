import React from "react";
import axios from "./axios";

export async function receiveFriendsWannabes() {
    try {
        const { data } = await axios.get(`/friends-wannabes`);
        return {
            type: "RECEIVE_FRIENDS_WANNABES",
            friendsWannabes: data,
        };
    } catch (err) {
        console.log("err in actions: ", err);
    }
}

export async function acceptFriendRequest(id) {
    try {
        await axios.post(`/accept-friend-request/${id}`);
        return {
            type: "ACCEPT_FRIEND_REQUEST",
            id,
        };
    } catch (err) {
        console.log("err in actions: ", err);
    }
}

export async function unfriend(id) {
    try {
        await axios.post(`/delete-friendship/${id}`);
        return {
            type: "UNFRIEND",
            id,
        };
    } catch (err) {
        console.log("err in actions: ", err);
    }
}

export function chatMessages(msgs) {
    return {
        type: "LAST_TEN_MESSAGES",
        msgs,
    };
}

export function chatMessage(msgs) {
    return {
        type: "NEW_MESSAGE",
        msgs,
    };
}

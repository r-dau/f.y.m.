import * as io from "socket.io-client";
import { chatMessages, chatMessage } from "./actions";

export let socket;

export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        // socket.on("addChatMsg", (msg) => {
        //     console.log(`My message is ${msg}`);
        // });

        socket.on("chatMessages", (msgs) => store.dispatch(chatMessages(msgs)));

        socket.on("chatMessage", (msg) => store.dispatch(chatMessage(msg)));
    }
};

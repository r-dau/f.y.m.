import React, { useEffect, useState } from "react";
import axios from "./axios";

export default function FriendButton(props) {
    const [buttonText, setButtonText] = useState("");
    console.log("buttonText: ", buttonText);
    const buttonStatus = {
        make: "Make friend request",
        accept: "Accept friend request",
        end: "End friendship",
        cancel: "Cancel friend request",
    };

    let { id } = props;
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`/friendship-status/${id}`);
                console.log("data in useEffect GET: ", data);
                // setButtonText(data);
                if (data.length < 1) {
                    setButtonText(buttonStatus.make);
                } else if (data[0].accepted) {
                    setButtonText(buttonStatus.end);
                    console.log("Cancel button");
                } else if (data[0].sender_id == props.id) {
                    setButtonText(buttonStatus.accept);
                } else if (data[0].receiver_id == props.id) {
                    setButtonText(buttonStatus.cancel);
                }
            } catch (err) {
                console.log("err in useEffect in friendbutton: ", err);
            }
        })();
    }, [id]);

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            if (buttonText == buttonStatus.make) {
                const { data } = await axios.post(
                    `/make-friend-request/${props.id}`
                );
                console.log("data in /make-friend-request POST: ", data);
                if (data) {
                    setButtonText(buttonStatus.cancel);
                } else {
                    console.log(data.error);
                }
            } else if (buttonText == buttonStatus.accept) {
                const { data } = await axios.post(
                    `/accept-friend-request/${props.id}`
                );
                console.log("data in /accept-friend-request POST: ", data);
                if (data) {
                    setButtonText(buttonStatus.end);
                } else {
                    console.log(data.error);
                }
            } else if (
                buttonText == buttonStatus.end ||
                buttonText == buttonStatus.cancel
            ) {
                const { data } = await axios.post(
                    `/delete-friendship/${props.id}`
                );
                if (data) {
                    setButtonText(buttonStatus.make);
                } else {
                    console.log(data.error);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return <button onClick={handleClick}>{buttonText}</button>;
}

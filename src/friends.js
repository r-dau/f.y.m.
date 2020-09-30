import React, { useEffect, useState } from "react";
import axios from "./axios";
import { Link } from "react-router-dom";
import {
    receiveFriendsWannabes,
    acceptFriendRequest,
    unfriend,
} from "./actions";
import { useDispatch, useSelector } from "react-redux";

export default function Friends() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(receiveFriendsWannabes());
    }, []);

    const acceptedFriends =
        useSelector(
            (state) =>
                state.friendsWannabes &&
                state.friendsWannabes.filter((friends) => friends.accepted)
        ) || [];

    console.log("acceptedFriends: ", acceptedFriends);

    const wannabeFriends =
        useSelector(
            (state) =>
                state.friendsWannabes &&
                state.friendsWannabes.filter((friends) => !friends.accepted)
        ) || [];

    console.log("wannabeFriends: ", wannabeFriends);

    return (
        <div className="friends-main-container">
            <div className="real-friends">
                <p>Friendslist</p>
                {acceptedFriends.map((elem, idx) => {
                    return (
                        <div key={idx} className="friends-pic">
                            <Link to={`/user/${elem.id}`}>
                                <p>
                                    {elem.first} {elem.last}
                                </p>
                                <img
                                    alt={`${elem.first} ${elem.last}`}
                                    src={elem.url}
                                />
                            </Link>
                            <button onClick={() => dispatch(unfriend(elem.id))}>
                                Unfriend
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="wannabe-friends">
                <p>Requests</p>
                {wannabeFriends.map((elem, idx) => {
                    return (
                        <div key={idx} className="friends-pic">
                            <Link to={`/user/${elem.id}`}>
                                <p>
                                    {elem.first} {elem.last}
                                </p>
                                <img
                                    alt={`${elem.first} ${elem.last}`}
                                    src={elem.url}
                                />
                            </Link>
                            <button
                                onClick={() =>
                                    dispatch(acceptFriendRequest(elem.id))
                                }
                            >
                                Accept
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

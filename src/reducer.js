export default function reducer(state = {}, action) {
    if (action.type == "RECEIVE_FRIENDS_WANNABES") {
        return { ...state, friendsWannabes: action.friendsWannabes };
    }

    if (action.type == "ACCEPT_FRIEND_REQUEST") {
        return (state = {
            ...state,
            friendsWannabes: state.friendsWannabes.map((friends) => {
                if (friends.id != action.id) {
                    return friends;
                } else {
                    return {
                        ...friends,
                        accepted: true,
                    };
                }
            }),
        });
    }

    if (action.type == "UNFRIEND") {
        return (state = {
            ...state,
            friendsWannabes: state.friendsWannabes.filter(
                (friends) => friends.id != action.id
            ),
        });
    }

    if (action.type == "LAST_TEN_MESSAGES") {
        return (state = {
            ...state,
            msgs: action.msgs,
        });
    }

    if (action.type == "NEW_MESSAGE") {
        return (state = {
            ...state,
            msgs: [...state.msgs, action.msgs],
        });
    }

    return state;
}

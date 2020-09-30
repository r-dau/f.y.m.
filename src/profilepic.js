import React from "react";

export default function ProfilePic(props) {
    // console.log("props in profilepic: ", props);
    let imageUrl = props.imageUrl || "default.png";

    return (
        <img
            src={imageUrl}
            alt={(props.first, props.last)}
            onClick={props.toggleModal}
        />
    );
}

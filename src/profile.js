import React from "react";
import ProfilePic from "./profilepic";
import BioEditor from "./bioediter";

export default function Profile(props) {
    console.log("props in profile.js: ", props);
    return (
        <div className="profile-container">
            <div className="profile-pic">
                <ProfilePic
                    first={props.first}
                    last={props.last}
                    imageUrl={props.imageUrl}
                    toggleModal={props.toggleModal}
                />
            </div>
            <div className="bio-container">
                <BioEditor
                    first={props.first}
                    last={props.last}
                    bio={props.bio}
                    changeBio={props.changeBio}
                    setBio={props.setBio}
                />
            </div>
        </div>
    );
}

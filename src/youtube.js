import React, { useRef } from "react";
import YouTube from "react-youtube";

export default function Youtube(props) {
    const youtube = props;

    const onReady = (event) => {
        event.target.pauseVideo();
    };

    const opts = {
        height: "270",
        width: "480",
        playerVars: {},
    };

    if (youtube) {
        return (
            <div className="youtube-container">
                {youtube.youtube &&
                    youtube.youtube.map((elem, idx) => {
                        return (
                            <YouTube
                                key={idx}
                                id={elem.snippet.title}
                                videoId={elem.id.videoId}
                                opts={opts}
                                onReady={onReady}
                            />
                        );
                    })}
            </div>
        );
    } else {
        return <div>no data</div>;
    }
}

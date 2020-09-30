import React, { useEffect, useState, useRef } from "react";
import axios from "./axios";
import Youtube from "./youtube";

export default function Music() {
    const [artist, setArtist] = useState();
    const [artistData, setArtistData] = useState([]);
    const [youtube, setYoutube] = useState([]);

    const elemRef = useRef();

    let imageUrl = "default.png";

    useEffect(() => {
        (async () => {
            const { data } = await axios.get(`/search/${artist || "+"}`);
            setArtistData(data);
            infiniteScrollSpotify(data);
        })();
    }, [artist]);

    const handleChange = (e) => {
        e.preventDefault();
        setArtist(e.target.value);
    };

    const handleClick = (e) => {
        e.preventDefault();
        (async () => {
            const { data } = await axios.get(`/youtube/${e.target.name}`);
            setYoutube(data);
        })();
    };

    const infiniteScrollSpotify = (myData) => {
        if (
            elemRef.current.scrollLeft + elemRef.current.clientWidth >=
            elemRef.current.scrollWidth - 100
        ) {
            (async () => {
                const { data } = await axios.get(`/search/${artist || "+"}`);
                setArtistData([...myData, ...data]);
                infiniteScrollSpotify([...myData, ...data]);
            })();
        } else {
            setTimeout(() => {
                infiniteScrollSpotify(myData);
            }, 1000);
        }
    };

    if (artistData) {
        return (
            <div>
                <input
                    className="spotify-search"
                    onChange={handleChange}
                    placeholder="Search for artist"
                />
                <div className="spotify-main-container" ref={elemRef}>
                    {artistData &&
                        artistData.map((elem, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="spotify-results-container"
                                >
                                    <img
                                        name={elem.name}
                                        alt={elem.name}
                                        src={
                                            elem.images[0]
                                                ? elem.images[0].url
                                                : imageUrl
                                        }
                                        onClick={(e) => handleClick(e)}
                                    />
                                    <p>{elem.name}</p>
                                </div>
                            );
                        })}
                </div>
                <Youtube className="youtube-container" youtube={youtube} />
            </div>
        );
    } else {
        return <div>no data</div>;
    }
}

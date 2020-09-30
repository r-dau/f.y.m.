import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(props) {
    return (
        <div className="menu-container">
            <div className="menu closed">
                {location.pathname != "/" && (
                    <Link className="menu-anchor" to="/">
                        <p>Profile</p>
                    </Link>
                )}
                {/* {location.pathname != "/friends" && (
                    <Link className="menu-anchor" to="/friends">
                        <p>Friends</p>
                    </Link>
                )} */}
                {location.pathname != "/spotify" && (
                    <Link className="menu-anchor" to="/spotify">
                        <p>Music</p>
                    </Link>
                )}
                {location.pathname != "/chat" && (
                    <Link className="menu-anchor" to="/chat">
                        <p>Chat</p>
                    </Link>
                )}

                <a className="menu-anchor" href="/logout">
                    <p>Log out</p>
                </a>
            </div>
        </div>
    );
}

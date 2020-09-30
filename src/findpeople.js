import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "./axios";

export default function FindPeople() {
    const [users, setUsers] = useState("");
    const [newUsers, setNewUsers] = useState([]);

    useEffect(() => {
        (async () => {
            const { data } = await axios.get(`/users/${users || "+"}`);
            console.log("data in axios findpeople: ", data);
            setNewUsers(data);
        })();
    }, [users]);

    const handleChange = (e) => {
        setUsers(e.target.value);
    };

    // const handleUserChange = (e) => {
    //     setNewUsers(e.target.value);
    // };

    return (
        <div className="findpeople-container">
            <h3>Find People</h3>
            <input onChange={handleChange} placeholder="Find other people." />
            <p>Checkout who just joined the anti social social club!</p>

            {newUsers.map((elem, idx) => {
                return (
                    <div key={idx} className="find-container">
                        <div className="profile-pic">
                            <Link to={`/user/${elem.id}`}>
                                <img
                                    alt={`${elem.first} ${elem.last}`}
                                    src={elem.url}
                                />
                            </Link>
                        </div>
                        <div className="bio-container">
                            <h4>
                                {elem.first} {elem.last}
                            </h4>
                            <p>{elem.bio}</p>
                        </div>
                    </div>
                );
            })}

            <div>
                {/* <div className="profile-pic">
                    <img
                        alt={`${this.state.first} ${this.state.last}`}
                        src={this.state.url}
                    />
                </div>
                <div className="bio-container">
                    <h4>
                        {this.state.first} {this.state.last}
                    </h4>
                    <p>{this.state.bio}</p>
                </div> */}
            </div>
        </div>
    );
}

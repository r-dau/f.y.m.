import React, { Component } from "react";
import Logo from "./logo";
import ProfilePic from "./profilepic";
import Uploader from "./uploader";
import Profile from "./profile";
import OtherProfile from "./otherprofile";
import FindPeople from "./findpeople";
// import BioEditor from "./bioediter";
import Friends from "./friends";
import Chat from "./chat";
import Music from "./spotify";
import Navbar from "./navbar";
import { BrowserRouter, Route, Link } from "react-router-dom";
import axios from "./axios";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploaderIsVisible: false,
            deleting: false,
            menuVisible: false,
        };
    }

    async componentDidMount() {
        const { data } = await axios.get("/user");
        // console.log("data in app.js: ", data);
        // console.log("what the fuck");
        this.setState(data);
    }

    toggleModal() {
        this.setState({
            uploaderIsVisible: !this.state.uploaderIsVisible,
        });
    }

    toggleDeleteModal() {
        this.setState({
            deleting: !this.state.deleting,
        });
    }

    toggleMenu() {
        const menu = document.querySelector(".menu");
        if (this.state.menuVisible) {
            menu.classList.remove("opened");
            menu.classList.add("closed");
            this.setState({ menuVisible: false });
        } else {
            menu.classList.remove("closed");
            menu.classList.add("opened");
            this.setState({ menuVisible: true });
        }
    }

    handleClick(e) {
        if (
            this.state.menuVisible &&
            e.target == document.querySelector(".menu-link")
        ) {
            return;
        } else if (this.state.menuVisible) {
            this.toggleMenu();
        }
    }

    setBio(bio) {
        this.setState({
            bio: bio,
        });
    }

    render() {
        return (
            <BrowserRouter>
                <div
                    className="application"
                    onClick={(e) => this.handleClick(e)}
                >
                    <header>
                        <Link to="/">
                            <Logo className="logo" />
                        </Link>
                        <div className="nav">
                            <div
                                className="menu-link"
                                onClick={() => this.toggleMenu()}
                            >
                                <div className="small-container">
                                    <ProfilePic
                                        className="nav-pic"
                                        first={this.state.first}
                                        last={this.state.last}
                                        imageUrl={this.state.url}
                                    />
                                </div>
                                <div className="arrow">
                                    <img alt="arrow" src="/down-arrow.png" />
                                </div>
                                <Navbar
                                    toggleDeleteModal={() =>
                                        this.toggleDeleteModal()
                                    }
                                />
                            </div>
                        </div>
                    </header>
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <Profile
                                first={this.state.first}
                                last={this.state.last}
                                toggleModal={() => this.toggleModal()}
                                imageUrl={this.state.url}
                                bio={this.state.bio}
                                setBio={(bio) => this.setBio(bio)}
                            />
                        )}
                    />
                    <Route
                        path="/user/:id"
                        render={(props) => (
                            <OtherProfile
                                id={props.id}
                                key={props.match.url}
                                match={props.match}
                                history={props.history}
                            />
                        )}
                    />
                    <Route
                        path="/findusers"
                        render={() => (
                            <FindPeople
                                first={this.props.first}
                                last={this.props.last}
                                imageUrl={this.props.url}
                            />
                        )}
                    />
                    <Route path="/friends" component={Friends} />
                    <Route path="/chat" component={Chat} />
                    <Route path="/spotify" component={Music} />

                    {this.state.uploaderIsVisible && (
                        <Uploader methodInApp={this.methodInApp} />
                    )}
                </div>
            </BrowserRouter>
        );
    }
}

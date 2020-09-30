import React, { Component } from "react";
import axios from "./axios";
// import { Link } from "react-router-dom";

export default class BioEditer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bioIsVisible: false,
            currentBio: this.props.bio,
        };
    }

    // componentDidMount() {
    //     // console.log('this.props: ', this.props);
    //     this.setState(
    //         {
    //             step: 1,
    //         },
    //         () => console.log("this.props in bioeditor: ", this.props)
    //     );
    // }

    handleChange(e) {
        this.setState(
            {
                currentBio: e.target.value,
            },
            () => console.log("this.state: ", this.state)
        );
    }

    addBio(e) {
        console.log("adding bio");
        e.preventDefault();
        this.setState({
            bioIsVisible: !this.state.bioIsVisible,
        });
    }

    async saveBio(e) {
        console.log("saving bio:", e);
        e.preventDefault();
        try {
            const { data } = await axios.post("/save", this.state);
            console.log("data in post save: ", data);
            this.props.setBio(data);
            this.setState({
                bioIsVisible: !this.state.bioIsVisible,
            });
        } catch (err) {
            console.log("err in post reset: ", err);
            this.setState({
                error: true,
            });
        }
    }

    getCurrentDisplay() {
        if (this.state.bioIsVisible) {
            return (
                <div className="bio-container">
                    <h3>
                        {this.props.first} {this.props.last}
                    </h3>
                    {this.state.error && (
                        <div>Opps, something went wrong...</div>
                    )}
                    <form>
                        <textarea
                            className="textarea"
                            defaultValue={this.props.bio}
                            name="currentBio"
                            rows="5"
                            cols="50"
                            autoComplete="off"
                            maxLength="255"
                            placeholder="Please enter you bio here"
                            onChange={(e) => this.handleChange(e)}
                        ></textarea>

                        <button
                            className="bio-button"
                            onClick={(e) => this.saveBio(e)}
                        >
                            Save
                        </button>
                    </form>
                </div>
            );
        } else if (!this.props.bio) {
            return (
                <div className="bio-container">
                    <h3>
                        {this.props.first} {this.props.last}
                    </h3>
                    <p onClick={(e) => this.addBio(e)}>Add your bio now</p>
                </div>
            );
        } else {
            return (
                <div className="bio-container">
                    <h3>
                        {this.props.first} {this.props.last}
                    </h3>
                    <p>{this.props.bio}</p>
                    <button
                        className="bio-button"
                        onClick={(e) => this.addBio(e)}
                    >
                        Edit
                    </button>
                </div>
            );
        }
    }

    render() {
        return <div>{this.getCurrentDisplay()}</div>;
    }
}

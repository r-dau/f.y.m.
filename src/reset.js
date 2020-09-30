import React, { Component } from "react";
// import { render } from "react-dom";
import axios from "./axios";
import { Link } from "react-router-dom";
import Logo from "./logo";

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.setState({
            step: 1,
        });
    }

    handleChange(e) {
        console.log("e.target.value: ", e.target.value);
        console.log("e.target.name: ", e.target.name);
        this.setState(
            {
                [e.target.name]: e.target.value,
            },
            () => console.log("this.stat: ", this.state)
        );
    }

    submitEmail(e) {
        console.log("about to submit!!!");
        e.preventDefault();
        axios
            .post("/reset", this.state)
            .then(({ data }) => {
                console.log("data from server: ", data);
                if (data.success) {
                    console.log("data in /reset: ");
                    this.setState({
                        step: 2,
                    });
                } else {
                    this.setState({
                        error: true,
                    });
                }
            })
            .catch((err) => console.log("err in post reset: ", err));
    }

    submitPassword(e) {
        console.log("submit password");
        e.preventDefault();
        axios
            .post("/reset/verify", this.state)
            .then(({ data }) => {
                if (data.success) {
                    console.log("update successful");
                    this.setState({
                        step: 3,
                    });
                } else {
                    this.setState({
                        error: true,
                    });
                }
            })
            .catch((err) => {
                console.log("err in submit password: ", err);
            });
    }

    getCurrentDisplay() {
        const step = this.state.step;
        if (step == 1) {
            return (
                <div>
                    <h3>Reset Password</h3>
                    <p>
                        Please enter the email address with which you registered
                    </p>
                    {this.state.error && (
                        <div>Opps, something went wrong...</div>
                    )}
                    <input
                        name="email"
                        placeholder="email"
                        type="email"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <button onClick={(e) => this.submitEmail(e)}>Submit</button>
                </div>
            );
        } else if (step == 2) {
            return (
                <div>
                    <h3>Reset Password</h3>
                    <p>Please enter the code you received</p>
                    {this.state.error && (
                        <div>Opps, something went wrong...</div>
                    )}
                    <input
                        name="code"
                        placeholder="code"
                        type="text"
                        key="code"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <p>Please enter a new password</p>
                    <input
                        name="password"
                        placeholder="password"
                        type="password"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <button onClick={(e) => this.submitPassword(e)}>
                        Submit
                    </button>
                </div>
            );
        } else {
            return (
                <div>
                    <h3>Reset Password</h3>
                    <p>Success!</p>
                    <p>
                        You con now <Link to="/login">Login</Link> with your new
                        password.
                    </p>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                <header>
                    <Logo />
                </header>
                <div className="reset-container">
                    {this.getCurrentDisplay()}
                </div>
            </div>
        );
    }
}

export default ResetPassword;

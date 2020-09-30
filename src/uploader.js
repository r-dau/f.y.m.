import React, { Component } from "react";
import axios from "./axios";

export default class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        console.log("UPLOADER COMPONENENT");
    }

    handleChange(e) {
        console.log("e.target.value: ", e.target.value);
        console.log("e.target.name: ", e.target.name);
        console.log("e.target: ", e.target);
        this.setState(
            {
                file: e.target.files[0],
                // [e.target.name]: e.target.value,
            },
            () => console.log("this.state: ", this.state)
        );
    }

    async methodInUploader() {
        // console.log("running mehtod in uploader");
        console.log("this.state.file: ", this.state.file);
        let formData = new FormData();
        formData.append("file", this.state.file);
        const data = await axios.post("/upload", formData);
        console.log("data: ", data);
        console.log("upload successful");
        this.props.methodInApp(data.url);
    }

    render() {
        return (
            <div className="upload-container">
                <form>
                    <input
                        type="file"
                        name="url"
                        accept="image/*"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <button onClick={(e) => this.methodInUploader(e)}>
                        Upload
                    </button>
                </form>
            </div>
        );
    }
}

import {Component} from 'react';
import Hero from "../../part/Hero.jsx";
import React from "react";

export default class HomePage extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return (
                <Hero/>
        );
    }
}

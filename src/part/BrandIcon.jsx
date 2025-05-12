/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/extensions */

import React from 'react';

import Button from '../elements/Button';
import Logo from '../assets/images/logo_ebay_express.png';


export default function BrandIcon() {
    return (
        <Button
            className=""
            type="link"
            href="/"
        >
            <img width={50} height={50} src={Logo} alt="logo_Ebay_express"
                 style={{ width: "200px", height: "120px", objectFit: "contain" }}
            />
        </Button>
    );
}

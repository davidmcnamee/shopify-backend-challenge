/** @format */

import {TopBar} from "@shopify/polaris";
import {useState} from "react";

const SearchField = () => {
    const [value, setValue] = useState("");
    return (
        <TopBar.SearchField value={value} onChange={setValue} placeholder="search" />
    );
};

export default SearchField;

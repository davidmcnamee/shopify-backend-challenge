/** @format */

import styled from "styled-components";

export const Price = ({price}: any) => {
    let oldPrice = null;
    let discountedPrice = null;
    let discount = null;
    if (price) {
        const numberFormat = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currency,
        });
        oldPrice = numberFormat.format(price.amount / 100);
        if (price.discount !== 0) {
            discountedPrice = numberFormat.format(
                (price.amount * (1 - price.discount / 10000)) / 100,
            );
            discount = "(" + (price.discount / 100).toString() + "% off!)";
        }
    }
    return (
        <Container>
            <Discount>{discountedPrice}</Discount>{" "}
            <RegularPrice strikethrough={discount}>{oldPrice}</RegularPrice>{" "}
            {price.currency} <Discount>{discount}</Discount>
        </Container>
    );
};

const Discount = styled.span`
    color: red;
    font-weight: 700;
`;

const RegularPrice = styled.span<{strikethrough: boolean}>`
    ${p => p.strikethrough && "text-decoration: line-through;"}
`;

const Container = styled.p`
    font-weight: bold;
    font-size: 1.6rem;
`;

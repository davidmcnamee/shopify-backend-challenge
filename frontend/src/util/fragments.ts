/** @format */

import {gql} from "@apollo/client";

export const IMAGE_FIELDS = gql`
    fragment ImageFields on Image {
        id
        url
        ownership {
            uploader {
                id
                username
            }
            owner {
                id
                username
            }
        }
        likes
        title
        public
        likedByMe
        forSale
        price {
            amount
            currency
            discount
        }
    }
`;

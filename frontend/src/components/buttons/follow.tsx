/** @format */

import {gql, useMutation} from "@apollo/client";
import {Button} from "@shopify/polaris";
import {FavoriteMajor, StarOutlineMinor} from "@shopify/polaris-icons";
import React, {FC} from "react";
import {client} from "../../util/apollo";

const FOLLOW_MUTATION = gql`
    mutation FollowMutation($id: ID!, $value: FollowingStatus!) {
        users {
            follow(id: $id, value: $value)
        }
    }
`;

type FollowingButtonProps = {
    followingStatus: "NOT_FOLLOWING" | "FOLLOWING_UNPAID" | "FOLLOWING_PAID";
    id: string;
};

export const FollowButton: FC<FollowingButtonProps> = ({followingStatus, id}) => {
    const [followMutation] = useMutation(FOLLOW_MUTATION);
    const buttons = {
        NOT_FOLLOWING: [FollowUnpaid, FollowPaid],
        FOLLOWING_UNPAID: [Unfollow, FollowPaid],
        FOLLOWING_PAID: [Unfollow],
    }[followingStatus];

    const onClick = async (...args) => {
        const {data} = await followMutation(...args);
        if(data.users.follow) window.location.href = data.users.follow;
        client.refetchQueries({include: ["UserPageQuery"]});
    };

    return (
        <>
            {buttons.map(B => (
                <B followMutation={onClick} id={id} />
            ))}
        </>
    );
};

const Unfollow = ({followMutation, id}) => (
    <Button
        icon={StarOutlineMinor}
        onClick={() => {
            followMutation({variables: {id, value: "NOT_FOLLOWING"}});
        }}
    >
        Unfollow
    </Button>
);

const FollowUnpaid = ({followMutation, id}) => (
    <Button
        icon={StarOutlineMinor}
        onClick={() => {
            followMutation({variables: {id, value: "FOLLOWING_UNPAID"}});
        }}
    >
        Follow
    </Button>
);

const FollowPaid = ({followMutation, id}) => (
    <Button
        icon={FavoriteMajor}
        onClick={() => {
            followMutation({variables: {id, value: "FOLLOWING_PAID"}});
        }}
    >
        Become a Premium Follower
    </Button>
);

import React, {FC, useState, useEffect} from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {fetchNote} from 'client';

interface HeaderIconProps {
    active?: boolean;
}

const HeaderIconContainer = styled.div<HeaderIconProps>`
    font-size: 18px;
    ${(props) => (props.active ? 'color: var(--button-bg);' : '')}
`;

const HeaderIcon:FC = () => {
    const currentChannelId = useSelector<GlobalState, string>(getCurrentChannelId);
    const [hasNote, setHasNote] = useState(false);

    useEffect(() => {
        const doFetch = async () => {
            const fetchedNote = await fetchNote(currentChannelId);
            setHasNote(fetchedNote !== '');
        };
        doFetch();
    }, [currentChannelId]);

    if (hasNote) {
        return (
            <HeaderIconContainer
                active={true}
                className={'fa fa-sticky-note'}
            />
        );
    }

    return (
        <HeaderIconContainer
            className={'fa fa-sticky-note-o'}
        />
    );
};

export default HeaderIcon;

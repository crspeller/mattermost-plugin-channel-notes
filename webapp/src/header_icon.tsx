import React, {FC, useState, useEffect} from 'react';
import styled from 'styled-components';
import {useSelector, useDispatch} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {fetchNote} from 'client';
import {setNoteValue} from 'redux_connectors';

interface HeaderIconProps {
    active?: boolean;
}

const HeaderIconContainer = styled.div<HeaderIconProps>`
    font-size: 18px;
    ${(props) => (props.active ? 'color: var(--button-bg);' : '')}
`;

const HeaderIcon:FC = () => {
    const dispatch = useDispatch();
    const currentChannelId = useSelector<GlobalState, string>(getCurrentChannelId);
    const [hasNote, setHasNote] = useState(false);

    useEffect(() => {
        const doFetch = async () => {
            const fetchedNote = await fetchNote(currentChannelId);
            setHasNote(fetchedNote !== '');
            dispatch(setNoteValue(currentChannelId, fetchedNote));
        };
        doFetch();
    }, [currentChannelId, dispatch]);

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

import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {fetchNote} from 'client';
import {setNoteValue} from 'redux_connectors';

const RootFetcher = () => {
    const dispatch = useDispatch();
    const currentChannelId = useSelector(getCurrentChannelId);

    useEffect(() => {
        const fetch = async () => {
            const fetchedNote = await fetchNote(currentChannelId);
            dispatch(setNoteValue(currentChannelId, fetchedNote));
        };

        fetch();
    }, [currentChannelId]);

    return null;
};

export default RootFetcher;

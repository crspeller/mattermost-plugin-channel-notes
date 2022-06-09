import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {fetchNote} from 'client';
import {setNoteValue} from 'redux_connectors';

const RootFetcher = () => {
    const dispatch = useDispatch();
    const currentChannelId = useSelector(getCurrentChannelId);

    useEffect(() => {
        const fetchChannelNote = async () => {
            if (currentChannelId) {
                const fetchedNote = await fetchNote(currentChannelId);
                dispatch(setNoteValue(currentChannelId, fetchedNote));
            }
        };

        fetchChannelNote();
    }, [currentChannelId]);

    return null;
};

export default RootFetcher;

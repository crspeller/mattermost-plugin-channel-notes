import React, {FC, useEffect, useState} from 'react';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {GlobalState} from 'mattermost-redux/types/store';
import {useDispatch, useSelector} from 'react-redux';

import styled from 'styled-components';

import {updateUpstream, fetchNote} from 'client';
import {makeSelectNoteValue, setNoteValue} from 'redux_connectors';

// @ts-ignore
const {formatText, messageHtmlToComponent} = window.PostUtils;

const markdownOptions = {
    singleline: false,
    mentionHighlight: true,
    atMentions: true,
};

const Header = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    justify-items: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height:47px;
    height: 47px;
    letter-spacing: 0;
    text-align: center;
    box-shadow: inset 0px -1px 0px var(--center-channel-color-24);
`;

const CenterCell = styled.div`
    grid-column-start: 2;
`;

const EditButton = styled.span`
    color: var(--button-color);
    background-color: var(--button-bg);
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;

    >.icon {
        font-size: 14px;
    }

    &:hover {
        background: linear-gradient(0deg, rgba(var(--center-channel-color-rgb), 0.16), rgba(var(--center-channel-color-rgb), 0.16)), var(--button-bg);
        text-decoration: none;
        color: var(--button-color);
    }
`;

const NoteContainer = styled.div`
    margin: 5px;
    padding: 16px;
`;

const NoteInput = styled.textarea`
    background-color: rgb(var(--center-channel-bg-rgb));
    border: none;
    padding: 16px;
    font-size: 14px;
    resize: none;
    flex-grow: 1;

    &:focus {
        border: none;
        box-shadow: inset 0 0 0 2px var(--button-bg);
    }
    
`;

const NoNotesContainer = styled.div`
    margin: 20px auto;
    display: block;
    flex-direction: column;
    align-items: center;
    max-width: 300px;

    h1 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        text-align: left;
        line-height: 32px;
    }

    p {
        margin: 16px 0;
        opacity: 0.56;
    }
`;

const GiantNotesIcon = styled.div`
    color: var(--button-bg);
    font-size: 100px;
    margin-bottom: 20px;
`;

const NoteRHS: FC = () => {
    const dispatch = useDispatch();
    const currentChannelId = useSelector<GlobalState, string>(getCurrentChannelId);
    const note = useSelector<GlobalState, string>(makeSelectNoteValue(currentChannelId));
    const [editMode, setEditMode] = useState(false);

    const updateNote = (value: string) => {
        dispatch(setNoteValue(currentChannelId, value));
        updateUpstream(currentChannelId, value);
    };

    if (!note && note !== '') {
        return null;
    }

    if (editMode) {
        return (
            <>
                <Header>
                    <CenterCell>
                        <EditButton onClick={() => setEditMode(false)}>
                            {'Done Editing'}
                        </EditButton>
                    </CenterCell>
                </Header>
                <NoteInput
                    placeholder={'Notes'}
                    autoFocus={true}
                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                        if (e.target) {
                            const input = e.target as HTMLTextAreaElement;
                            updateNote(input.value);
                        }
                    }}
                    value={note}
                />
            </>
        );
    }

    let notesView = null;
    if (note === '') {
        notesView = (
            <NoNotesContainer>
                <GiantNotesIcon className={'fa fa-sticky-note-o'}/>
                <h1>
                    {'Take quick notes shared with everyone in the channel.'}
                </h1>
                <p>
                    {"You don't have any notes at the moment. Use the edit button above to start writing!"}
                </p>
            </NoNotesContainer>
        );
    } else {
        notesView = messageHtmlToComponent(formatText(note, markdownOptions), true, {});
    }

    return (
        <>
            <Header>
                <CenterCell>
                    <EditButton onClick={() => setEditMode(true)}>
                        {'Edit Note'}
                    </EditButton>
                </CenterCell>
            </Header>
            <NoteContainer>
                {notesView}
            </NoteContainer>
        </>
    );
};

export default NoteRHS;

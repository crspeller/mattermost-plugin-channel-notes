import {Store, Action} from 'redux';

import styled, {createGlobalStyle} from 'styled-components';
import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {Client4} from 'mattermost-redux/client';
import {ClientError} from 'mattermost-redux/client/client4';

import React, {FC, useEffect, useState, useCallback} from 'react';

import {useSelector} from 'react-redux';
import {debounce} from 'debounce';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

const apiUrl = `/plugins/${manifest.id}/api/v0`;

const markdownOptions = {
    singleline: false,
    mentionHighlight: true,
    atMentions: true,
};

// @ts-ignore
const {formatText, messageHtmlToComponent} = window.PostUtils;

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

const updateUpstream = debounce((currentChannelId: string, note: string) => {
    doFetchWithResponse(
        apiUrl + '/note/' + currentChannelId, {
            method: 'post',
            body: JSON.stringify({
                note,
            }),
        },
    );
}, 500);

const NoteRHS: FC = () => {
    const currentChannelId = useSelector<GlobalState, string>(getCurrentChannelId);
    const [note, setNote] = useState<string>('');
    const [editMode, setEditMode] = useState(false);

    const updateNote = (value: string) => {
        setNote(value);
        updateUpstream(currentChannelId, value);
    };

    useEffect(() => {
        const fetchNote = async () => {
            const {data} = await doFetchWithResponse(apiUrl + '/note/' + currentChannelId, {method: 'get'});
            setNote(data.note);
        };
        fetchNote();
    }, [currentChannelId]);

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

export const doFetchWithResponse = async (url: string, options = {}) => {
    const response = await fetch(url, Client4.getOptions(options));

    let data;
    if (response.ok) {
        data = await response.json();
        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

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
        const fetchNote = async () => {
            const {data} = await doFetchWithResponse(apiUrl + '/note/' + currentChannelId, {method: 'get'});
            setHasNote(data.note !== '');
        };
        fetchNote();
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

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        const {toggleRHSPlugin} = registry.registerRightHandSidebarComponent(NoteRHS, 'Notes');
        const boundToggleRHSAction = (): void => store.dispatch(toggleRHSPlugin);

        registry.registerChannelHeaderButtonAction(<HeaderIcon/>, boundToggleRHSAction, 'Incidents', 'Incidents');
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());

import {combineReducers} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import manifest from './manifest';

export const SET_NOTE_VALUE = manifest.id + '_set_channel_note';

export interface SetNoteValue {
    type: typeof SET_NOTE_VALUE;
    channelID: string;
    value: string;
}

const notesByChannel = (state: Record<string, string> = {}, action: SetNoteValue) => {
    switch (action.type) {
    case SET_NOTE_VALUE:
        return {
            ...state,
            [action.channelID]: action.value,
        };
    default:
        return state;
    }
};

export const reducer = combineReducers({
    notesByChannel,
});

//@ts-ignore GlobalState is not complete
const pluginState = (state: GlobalState) => state['plugins-' + manifest.id] || {};

export const makeSelectNoteValue = (channelId: string) => (state: GlobalState) => pluginState(state).notesByChannel[channelId];

export function setNoteValue(channelID: string, value: string): SetNoteValue {
    return {
        type: SET_NOTE_VALUE,
        channelID,
        value,
    };
}

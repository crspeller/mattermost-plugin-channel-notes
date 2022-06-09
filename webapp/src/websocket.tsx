import {Dispatch} from 'redux';

import {GetStateFunc} from 'mattermost-redux/types/actions';
import {WebSocketMessage} from 'mattermost-redux/types/websocket';

import {fetchNote} from 'client';
import {setNoteValue} from 'redux_connectors';

export function handleWebsocketNoteUpdate(_: GetStateFunc, dispatch: Dispatch) {
    return async (msg: WebSocketMessage<{note: string}>) => {
        dispatch(setNoteValue(msg.broadcast.channel_id, msg.data.note));
    };
}

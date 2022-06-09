import WebsocketEvents from 'mattermost-redux/constants/websocket';
import {GlobalState} from 'mattermost-redux/types/store';

import React from 'react';
import {Action, Store} from 'redux';

//@ts-ignore Webapp imports don't work properly
import {PluginRegistry} from 'mattermost-webapp/plugins/registry';

import NoteRHS from 'note_rhs';
import HeaderIcon from 'header_icon';
import RootFetcher from 'root_fetcher';
import {handleWebsocketNoteUpdate} from 'websocket';

import manifest from './manifest';
import {reducer} from './redux_connectors';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        registry.registerRootComponent(RootFetcher);
        registry.registerReducer(reducer);

        const {toggleRHSPlugin} = registry.registerRightHandSidebarComponent(NoteRHS, 'Notes');
        const boundToggleRHSAction = (): void => store.dispatch(toggleRHSPlugin);

        registry.registerChannelHeaderButtonAction(<HeaderIcon/>, boundToggleRHSAction, 'Channel Notes', 'Channel Notes');

        const channelNoteUpateEvent = `custom_${manifest.id}_channel_note_update`;
        registry.registerWebSocketEventHandler(channelNoteUpateEvent, handleWebsocketNoteUpdate(store.getState, store.dispatch));
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());

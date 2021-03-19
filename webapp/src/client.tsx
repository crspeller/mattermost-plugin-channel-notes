import {debounce} from 'debounce';

import {Client4} from 'mattermost-redux/client';
import {ClientError} from 'mattermost-redux/client/client4';

import manifest from 'manifest';

const apiUrl = `/plugins/${manifest.id}/api/v0`;

export const updateUpstream = debounce((currentChannelId: string, note: string) => {
    doFetchWithResponse(
        apiUrl + '/note/' + currentChannelId, {
            method: 'post',
            body: JSON.stringify({
                note,
            }),
        },
    );
}, 500);

export const fetchNote = async (channelId: string) => {
    const {data} = await doFetchWithResponse(apiUrl + '/note/' + channelId, {method: 'get'});
    return data.note;
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

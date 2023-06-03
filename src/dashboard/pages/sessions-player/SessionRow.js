import {IconButton, TableCell, Tooltip} from "@material-ui/core";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import React from "react";

const SessionRow = ({row}) => {

    const checkFileStatus = async (id, format) => {
        const url = process.env.REACT_APP_RECORDING_URL + `?sessionId=${id}&format=${format}`;
        const fetchResult = await fetch(url, {
            method: 'head',
        });
        const isAvailable = fetchResult.status === 200 || fetchResult.status === 304
        if (isAvailable) {
            return {url};
        }
        try {
            const {message} = await fetchResult.json()
            return {message};
        } catch (e) {}//not a json
        return {};
    }

    const handleClickPlayback = async id => {
        const status = await checkFileStatus(id, 'recording-play');
        if (status?.url) {
            const playerUrl = process.env.REACT_APP_PLAYBACK_URL + '?s=' + btoa(status.url);
            window.open(playerUrl, '_blank');
        } else {
            const message = status?.message || 'Recording not available';
            alert(message);
        }
    }

    return (
        <>
            <TableCell align="right" style={{width: 150, paddingRight: 0}}>
                <Tooltip title="Playback">
                    <IconButton onClick={e => handleClickPlayback(row.name?.split('.')?.[0])}
                                color="primary"
                                aria-label="view">
                        <VideoLibraryIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            </TableCell>
            <TableCell>{row.name}</TableCell>
        </>
    )
}

export default SessionRow;
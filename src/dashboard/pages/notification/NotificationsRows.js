import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery,useLazyQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {changeTimeZone} from "../../../utilities/Utils";
import CallReceivedIcon from '@material-ui/icons/CallReceived';
import CallMadeIcon from '@material-ui/icons/CallMade';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
    med_priority: {
        backgroundColor: '#ffea0021'
   },
    high_priority: {
        backgroundColor: '#ff17171d'
    },
    low_priority: {
        backgroundColor: '#00ff1119'
    },
}));

const NotificationRows = ({row}) => {
    console.log("Fsddsfdsfdsfdsfsd");
    const classes = useStyles();
    const history = useHistory();
    
    const handleDisplayClick = id => {
        history.push('/dashboard/notifications/' + id + '/view');
    }

        if(row?.priority == 'high'){
            return (
                <>
                    <TableCell className={classes.high_priority} align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.high_priority}>{row.sender_status=="sender" ? <CallMadeIcon /> : <CallReceivedIcon /> }</TableCell>
                    <TableCell className={classes.high_priority}>{row.creator}</TableCell>
                    <TableCell className={classes.high_priority}>{row.subject.substring(0,15)}</TableCell>
                    <TableCell className={classes.high_priority}>{row.message.substring(0,20)}</TableCell>
                    <TableCell className={classes.high_priority}>High</TableCell>
                    <TableCell className={classes.high_priority}>{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
        }else if(row?.priority == 'medium'){
            return (
                <>
                    <TableCell className={classes.med_priority} align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.med_priority}>{row.sender_status=="sender" ? <CallMadeIcon /> : <CallReceivedIcon /> }</TableCell>
                    <TableCell className={classes.med_priority}>{row.creator}</TableCell>
                    <TableCell className={classes.med_priority}>{row.subject.substring(0,15)}</TableCell>
                    <TableCell className={classes.med_priority}>{row.message.substring(0,20)}</TableCell>
                    <TableCell className={classes.med_priority}>Medium</TableCell>
                    <TableCell className={classes.med_priority}>{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
        }else{
            return (
                <>
                    <TableCell className={classes.low_priority} align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.low_priority}>{row.sender_status=="sender" ? <CallMadeIcon /> : <CallReceivedIcon /> }</TableCell>
                    <TableCell className={classes.low_priority}>{row.creator}</TableCell>
                    <TableCell className={classes.low_priority}>{row.subject.substring(0,15)}</TableCell>
                    <TableCell className={classes.low_priority}>{row.message.substring(0,20)}</TableCell>
                    <TableCell className={classes.low_priority}>Low</TableCell>
                    <TableCell className={classes.low_priority}>{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
        }
    
}

export default NotificationRows;
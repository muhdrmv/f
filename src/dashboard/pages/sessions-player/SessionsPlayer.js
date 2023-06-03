import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import {IconButton, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {gql, useQuery} from "@apollo/client";
import EnhancedTable from "../../shared-components/EnhancedTable";
import HistoryIcon from '@material-ui/icons/History';
import {PageviewOutlined} from "@material-ui/icons";
import SessionRow from "./SessionRow";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
}));

const GET_SESSIONS = gql`
query {
  action_rec_sessions_play {
    name
  }
}
`;

const headCells = [
    {id: 'play', numeric: false, disablePadding: true, label: ''},
    {id: 'name', numeric: false, disablePadding: false, label: 'name'},
];

const SessionsPlayer = () => {
    const classes = useStyles();
    const [query,] = useState(GET_SESSIONS);
    const {loading, data, refetch} = useQuery(query);
    const [rows, setRows] = useState([]);

    useEffect( () => {
        const rows = data?.action_rec_sessions_play ?? [];
        setRows(rows);
    }, [data])

    const handleRefresh = () => {
        refetch();
    }


    const RowCells = ({row}) => <SessionRow row={row}/>

    const CustomFilter = () => {
        return <></>;
    }

    const ExtraToolbar = () => {
        return (
            <Tooltip title="Sessions History">
                <IconButton component={Link} to="sessions-history">
                    <HistoryIcon/>
                </IconButton>
            </Tooltip>
        )
    }

    return (
        <div className={classes.root}>
            <EnhancedTable rowsSelectable={false} rowsAddable={false} tableTitle="Sessions Player"
                           extraToolbar={ExtraToolbar} rowsFilterable={false}
                           rows={rows ?? []} showProgress={loading}
                           headCells={headCells} rowCells={RowCells}
                           onClickRefresh={handleRefresh}
                           showFilterPanel={true}
                           toolbarIcon={<PageviewOutlined style={{margin: '-4px 8px'}}/>}
                           customFilter={CustomFilter}/>
        </div>
    )
}

export default SessionsPlayer

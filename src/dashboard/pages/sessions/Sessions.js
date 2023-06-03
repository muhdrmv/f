import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import {IconButton, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {gql, useQuery} from "@apollo/client";
import EnhancedTable from "../../shared-components/EnhancedTable";
import HistoryIcon from '@material-ui/icons/History';
import {PageviewOutlined} from "@material-ui/icons";
import CustomFilter from "./CustomFilter";
import SessionRow from "./SessionRow";
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
}));

const GET_SESSIONS = gql`
query {
  sessions
    (order_by: {created_at: desc}) {
    id
    meta
    status
    created_at
    access_rule {
      name
    }
    connection {
      name
    }
    user {
      username
    }
  }
}
`;

const GET_SESSIONS_FILTERED_WHERE = gql`
query ($where: sessions_bool_exp) {
  sessions(
    order_by: {created_at: desc}, 
    where: $where
  ) {
    id
    meta
    status
    created_at
    access_rule {
      name
    }
    connection {
      name
    }
    user {
      username
    }
  }
}
`;

const headCells = [
    {id: 'play', numeric: false, disablePadding: true, label: ''},
    {id: 'username', numeric: false, disablePadding: false, label: 'Username'},
    {id: 'connection', numeric: false, disablePadding: false, label: 'Connection'},
    {id: 'access_rule', numeric: false, disablePadding: false, label: 'Access Rule', notSortable: true},
    {id: 'status', numeric: false, disablePadding: false, label: 'Status', notSortable: true},
    {id: 'created_at', numeric: false, disablePadding: false, label: 'Started - Closed At'},
];

const Sessions = () => {
    const classes = useStyles();
    const [query, setQuery] = useState(GET_SESSIONS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [rows, setRows] = useState([]);
    const [where, setWhere] = useState(null);

    useEffect(() => {
        const gotRows = data?.sessions ?? [];
        setRows(gotRows);
    }, [data])

    useEffect(() => {
        if (where)
            enableFilterQuery(where);
        else
            disableFilterQuery()
    }, [where])


    useEffect(() => {
        refetch();
    }, [])

    const handleRefresh = () => {
        refetch();
    }

    const handleClickFilter = () => {
        setShowFilterPanel(f => !f);
    }

    const enableFilterQuery = (where) => {
        setQuery(GET_SESSIONS_FILTERED_WHERE);
        setQueryVars({where})
    }

    const disableFilterQuery = () => {
        setQuery(GET_SESSIONS);
        setQueryVars({})
    }

    const RowCells = ({row}) => <SessionRow row={row}/>

    const ExtraToolbar = () => {
        return (
            <>
                <Tooltip title="Search Keystrokes">
                    <IconButton component={Link} to="sessions-search">
                        <PageviewOutlined/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Sessions Player">
                    <IconButton component={Link} to="sessions-player">
                        <PlayCircleOutlineIcon/>
                    </IconButton>
                </Tooltip>
            </>
        )
    }

    return (
        <div className={classes.root}>
            <EnhancedTable rowsSelectable={false} rowsAddable={false} tableTitle="Sessions History"
                           extraToolbar={ExtraToolbar}
                           rows={rows ?? []} showProgress={loading}
                           headCells={headCells} rowCells={RowCells}
                           onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                           showFilterPanel={showFilterPanel}
                           toolbarIcon={<HistoryIcon style={{margin: '-4px 8px'}}/>}
                           customFilter={CustomFilter} customFilterProps={{setWhere}}/>
        </div>
    )
}

export default Sessions

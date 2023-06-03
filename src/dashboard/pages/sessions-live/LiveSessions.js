import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {gql, useQuery} from "@apollo/client";
import EnhancedTable from "../../shared-components/EnhancedTable";
import PlayCircleOutlineRoundedIcon from '@material-ui/icons/PlayCircleOutlineRounded';
import SessionRow from "../sessions/SessionRow";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
}));

const GET_LIVE_SESSIONS = gql`
query {
  sessions(
    order_by: {created_at: desc},
    where: {status: {_eq: "live"}}
  ) {
    id
    meta
    status
    access_rule {
      name
      meta
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

const GET_LIVE_SESSIONS_FILTERED = gql`
query ($filter: String!) {
  sessions(
    order_by: {created_at: desc}, 
    where: {
    _or: [
      {status: {_eq: "live"}}, 
      {connection: {name: {_ilike: $filter}}},
      {user: {username: {_ilike: $filter}}},
      {access_rule: {name: {_ilike: $filter}}},
    ]
  }) {
    id
    meta
    status
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
    {id: 'access_rule', numeric: false, disablePadding: false, label: 'Access Rule'},
    {id: 'status', numeric: false, disablePadding: false, label: 'Status'},
    {id: 'created_at', numeric: false, disablePadding: false, label: 'Started - Closed At'},
];

const LiveSessions = () => {
    const classes = useStyles();
    const [query, setQuery] = useState(GET_LIVE_SESSIONS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [rows, setRows] = useState([]);

    useEffect(() => {
        handleChangeFilterText();
    }, [showFilterPanel])

    useEffect( () => {
        refetch();
    }, [])

    useEffect( () => {
        const gotRows = data?.sessions ?? [];
        setRows(gotRows);
    }, [data])

    const handleRefresh = () => {
        refetch();
    }

    const handleClickFilter = () => {
        setShowFilterPanel(f => !f);
    }

    const handleChangeFilterText = (e) => {
        if (showFilterPanel && e && e.target.value.trim() !== '') {
            enableFilterQuery('%' + e.target.value.trim() + '%');
        } else {
            disableFilterQuery();
        }
    }

    const enableFilterQuery = (filterText) => {
        setQuery(GET_LIVE_SESSIONS_FILTERED);
        setQueryVars({filter: filterText})
    }

    const disableFilterQuery = () => {
        setQuery(GET_LIVE_SESSIONS);
        setQueryVars({})
    }

    const RowCells = ({row}) => <SessionRow row={row}/>

    return (
        <div className={classes.root}>
            
            <EnhancedTable rowsSelectable={false} rowsAddable={false} tableTitle="Live Sessions" rows={rows} showProgress={loading}
                            headCells={headCells} rowCells={RowCells}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText} 
                            toolbarIcon={<PlayCircleOutlineRoundedIcon style={{margin: '-4px 8px'}}/>} />

        </div>
    )
}

export default LiveSessions

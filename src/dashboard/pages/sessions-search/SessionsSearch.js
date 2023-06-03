import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import {Grid, IconButton, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {gql, useQuery} from "@apollo/client";
import EnhancedTable from "../../shared-components/EnhancedTable";
import HistoryIcon from '@material-ui/icons/History';
import TextField from "@material-ui/core/TextField";
import {PageviewOutlined} from "@material-ui/icons";
import SessionRow from "../sessions/SessionRow";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
}));

const GET_SESSIONS = gql`
query ($filter: SessionsSearchFilter!) {
  action_sess_sessions_search(filter: $filter) {
    id
    session {
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
}
`;

const ACTION_MGMT_ENCODER = gql`
mutation ($sessionId: uuid!, $task: String!) {
  action_mgmt_encoder(sessionId: $sessionId, task: $task) {
    meta
  }
}
`;

const GET_SESSIONS_FILTERED_WHERE = gql`
query ($filter: SessionsSearchFilter!) {
  action_sess_sessions_search(filter: $filter) {
    id
    session {
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

const SessionsSearch = () => {
    const classes = useStyles();
    const [query, setQuery] = useState(GET_SESSIONS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [filter, setFilter] = useState({text: '', dateFrom: null, dateTo: null});
    const [rows, setRows] = useState([]);

    useEffect(() => {
        handleChangeFilterText()
    }, [showFilterPanel])

    useEffect( () => {
        const gotRows = data?.action_sess_sessions_search ?? [];
        const rows = gotRows.map(i => i?.session).filter(i => !!i);
        setRows(rows);
    }, [data])

    useEffect(() => {
        enableFilterQuery({text: filter.text});
    }, [filter])

    useEffect(() => {
        refetch();
    }, [])

    const handleRefresh = () => {
        refetch();
    }

    const handleClickFilter = () => {
        setShowFilterPanel(f => !f);
    }

    const handleChangeFilterText = (e) => {
        setFilter(s => ({...s, text: e?.target.value}));
    }

    const enableFilterQuery = (filter) => {
        setQuery(GET_SESSIONS_FILTERED_WHERE);
        setQueryVars({filter})
    }

    const RowCells = ({row}) => <SessionRow row={row}/>

    const CustomFilter = () => {
        return (
            <div>
                <Grid container spacing={1} style={{margin: '1%', width: '98%'}}>

                    <Grid item xs={12}>
                        <TextField label="Search keystrokes" variant="outlined" autoFocus={true} fullWidth margin="normal"
                                   value={filter.text} onChange={handleChangeFilterText}/>
                    </Grid>

                    {/*<Grid item xs={4}>*/}
                    {/*    <MuiPickersUtilsProvider utils={DateFnsUtils}>*/}
                    {/*        <KeyboardDatePicker*/}
                    {/*            inputVariant="outlined"*/}
                    {/*            autoOk*/}
                    {/*            fullWidth*/}
                    {/*            disableToolbar*/}
                    {/*            variant="inline"*/}
                    {/*            format="dd-MM-yyyy"*/}
                    {/*            margin="normal"*/}
                    {/*            label="From Date"*/}
                    {/*            value={filter.dateFrom}*/}
                    {/*            onChange={handleChangeFilterDateFrom}*/}
                    {/*        />*/}
                    {/*    </MuiPickersUtilsProvider>*/}
                    {/*</Grid>*/}

                    {/*<Grid item xs={4}>*/}
                    {/*    <MuiPickersUtilsProvider utils={DateFnsUtils}>*/}
                    {/*        <KeyboardDatePicker*/}
                    {/*            inputVariant="outlined"*/}
                    {/*            autoOk*/}
                    {/*            fullWidth*/}
                    {/*            disableToolbar*/}
                    {/*            variant="inline"*/}
                    {/*            format="dd-MM-yyyy"*/}
                    {/*            margin="normal"*/}
                    {/*            label="To Date"*/}
                    {/*            value={filter.dateTo}*/}
                    {/*            onChange={handleChangeFilterDateTo}*/}
                    {/*        />*/}
                    {/*    </MuiPickersUtilsProvider>*/}
                    {/*</Grid>*/}

                </Grid>
            </div>
        )
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
            <EnhancedTable rowsSelectable={false} rowsAddable={false} tableTitle="Sessions Search"
                           extraToolbar={ExtraToolbar} rowsFilterable={false}
                           rows={rows ?? []} showProgress={loading}
                           headCells={headCells} rowCells={RowCells}
                           onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                           showFilterPanel={true} onChangeFilterText={handleChangeFilterText}
                           toolbarIcon={<PageviewOutlined style={{margin: '-4px 8px'}}/>}
                           customFilter={CustomFilter}/>
        </div>
    )
}

export default SessionsSearch

import EnhancedTable from "./EnhancedTable";
import AssignmentIcon from "@material-ui/icons/Assignment";
import React, {useEffect, useState} from "react";
import AlertDialog from "../pages/logs/AlertDialog";
import {makeStyles} from "@material-ui/core/styles";
import {gql, useQuery} from "@apollo/client";
import {IconButton, TableCell, Tooltip} from "@material-ui/core";
import {changeTimeZone} from "../../utilities/Utils";
import CustomFilter from "../pages/logs/CustomFilter";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%'
    },
}));

const GET_LOGS_FILTERED = gql`
query ($where: logs_bool_exp) {
  logs(
    order_by: {created_at: desc}, 
    where: $where
  ) {
    id
    meta
    service
    type
    created_at
  }
}
`;

const headCells = [
    {id: 'view', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'created_at', numeric: false, disablePadding: false, label: 'Date and time'},
    {id: 'type', numeric: false, disablePadding: false, label: 'Type'},
    {id: 'group_name', numeric: false, disablePadding: false, label: 'Information', notSortable: true},
    {id: 'username', numeric: false, disablePadding: false, label: 'Username',      notSortable: true},
    {id: 'user_ip_address', numeric: false, disablePadding: false, label: 'User IP',notSortable: true},
];

const LogsBox = ({defaultWhere, ...props}) => {
    const classes = useStyles();
    const [queryVars, setQueryVars] = useState({where: defaultWhere});
    const {loading, data, refetch} = useQuery(GET_LOGS_FILTERED, {
        variables: queryVars || {where: defaultWhere},
    });

    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [where, setWhere] = useState(null);
    const [rows, setRows] = useState([]);

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [contentText, setContentText] = useState('');
    const [contentDatetime, setContentDatetime] = useState('');
    const [contentDescription, setContentDescription] = useState('');

    const handleRefresh = () => {
        refetch();
    }

    const handleClickFilter = () => {
        setShowFilterPanel(f => !f);
    }

    useEffect(() => {
        if (where)
            enableFilterQuery(where);
        else
            disableFilterQuery()
    }, [where])

    useEffect(() => {
        setRows(data?.logs || []);
    }, [data])

    const enableFilterQuery = (where) => {
        if (!defaultWhere)
            setQueryVars({where})
    }

    const disableFilterQuery = () => {
        if (!defaultWhere)
            setQueryVars({})
    }

    const handleClickDetails = async row => {
        setContentText(JSON.stringify(row.meta, null, 2));
        setContentDescription(row.type);
        setContentDatetime(changeTimeZone(row.created_at));
        setAlertDialogOpen(true);
    }

    const handleDialogClose = () => {
        setAlertDialogOpen(false);
    }

    const RowCells = ({row}) => {
        return (
            <>
                <TableCell align="right" style={{width: 50, paddingRight: 0}}>
                    <Tooltip title="Details">
                        <IconButton onClick={e => handleClickDetails(row)}
                                    color="primary"
                                    aria-label="view">
                            <AssignmentIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell>
                    {changeTimeZone(row.created_at)}
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                    {
                        row.meta?.reason ||
                        row.meta?.connection_group_name ||
                        row.meta?.user_group_name ||
                        ''
                    }
                </TableCell>
                <TableCell>{row.meta?.username || row.meta?.by_username}</TableCell>
                <TableCell>{row.meta?.user_ip_address}</TableCell>
            </>
        )
    }

    return (
        <div className={classes.root}>

            <EnhancedTable rowsSelectable={false} rowsAddable={false} tableTitle="System Logs"
                           rows={rows} showProgress={loading}
                           headCells={headCells} rowCells={RowCells}
                           onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                           showFilterPanel={showFilterPanel}
                           toolbarIcon={<AssignmentIcon style={{margin: '-4px 8px'}}/>}
                           customFilter={CustomFilter} customFilterProps={{setWhere}}
                           {...props} />

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose}
                         contentText={contentText}
                         contentDatetime={contentDatetime}
                         contentDescription={contentDescription}/>

        </div>
    )

}

export default LogsBox;
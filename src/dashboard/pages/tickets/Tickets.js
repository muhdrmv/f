import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {gql, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {changeTimeZone} from "../../../utilities/Utils";
import MessageIcon from '@material-ui/icons/Message';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    }
}));

const GET_ADMIN_TICKETS = gql`
query {
    tickets(
        order_by: {created_at: desc}, 
    ) {
        id
        created_at
        subject
        status
        priority
        applicant_user {
            username
        }
    }
}
`;

const GET_ADMIN_TICKETS_FILTER = gql`
query ($filter: String!) {
    tickets(
        order_by: {created_at: desc}, 
        where: {
            _or:[
                {subject: {_ilike: $filter}},
                {applicant_user: {username: {_ilike: $filter}}}
            ]
        }
    ){
        id
        created_at
        subject
        status
        priority
        applicant_user {
            username
        }
    }
}
`;

const headCells = [
    {id: 'display', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'subject', numeric: false, disablePadding: false, label: 'Subject'},
    {id: 'username', numeric: false, disablePadding: false, label: 'Username'},
    {id: 'priority', numeric: false, disablePadding: false, label: 'Priority'},
    {id: 'status', numeric: false, disablePadding: false, label: 'Status'},
    {id: 'created_at', numeric: false, disablePadding: false, label: 'Created At'},
];

const Tickets = ({loggedInUser}) => {

    const classes = useStyles();
    const history = useHistory();

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [queryVars, setQueryVars] = React.useState({user_id: loggedInUser?.id});
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [rows, setRows] = useState([]);

    const [query, setQuery] = useState(GET_ADMIN_TICKETS);
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});

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
        setQuery(GET_ADMIN_TICKETS_FILTER);
        setQueryVars({filter: filterText, user_id: loggedInUser.id})
    }

    const disableFilterQuery = () => {
        setQuery(GET_ADMIN_TICKETS);
        setQueryVars({user_id: loggedInUser.id});
    }

    const handleDisplayClick = id => {
        history.push('/dashboard/tickets/' + id + '/view');
    }

    const [selectedItems, setSelectedItems] = useState([]);

    const handleClickDelete = (selected) => {
       alert("You are not able to delete Ticket")
    }

    useEffect( () => {
        const gotRows = data?.tickets ?? [];
        setRows(gotRows.map( v => ({
            id: v?.id,
            subject: v?.subject,
            username: v?.applicant_user?.[0]?.username,
            priority: v?.priority,
            status: v?.status,
            created_at: v?.created_at
        })));
    }, [data]);

    useEffect(() => {
        handleChangeFilterText()
    }, [showFilterPanel]);


    const RowCells = ({row}) => {
            return (
                <>
                    <TableCell align="right" style={{width: 50}}>
                        <Tooltip title="Display">
                            <IconButton onClick={e => handleDisplayClick(row.id)}
                                        color="primary"
                                        aria-label="Display">
                                <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell >{row.subject.substring(0,15)}</TableCell>
                    <TableCell >{row.username}</TableCell>
                    <TableCell >{row.priority}</TableCell>
                    <TableCell >{row.status}</TableCell>
                    <TableCell >{changeTimeZone(row.created_at)}</TableCell>
                </>
            )
    }

    return (
        <div className={classes.root}>
            <EnhancedTable tableTitle="Tickets" rows={rows} showProgress={loading}
                            headCells={headCells} rowCells={RowCells} rowsAddable={false}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            onClickDelete={handleClickDelete}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                            addLinkUrl="/dashboard/tickets/add"
                            toolbarIcon={<MessageIcon style={{margin: '-4px 8px'}}/>} />

            <AlertDialog isOpen={alertDialogOpen} itemsCount={selectedItems.length}/>
        </div>
    )
}

export default Tickets;

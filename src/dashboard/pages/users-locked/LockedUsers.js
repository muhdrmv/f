import React, {useEffect, useState} from 'react'
import {Link, useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import {gql, useMutation, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import PersonIcon from "@material-ui/icons/Person";
import CloudOffIcon from '@material-ui/icons/CloudOff';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
}));

const GET_LOCKED_USERS = gql`
query {
  action_auth_locked_users {
    id
    user {
      id
      username
      name
      meta
      role
    }
  }
}
`;

const LOCKED_USER_UNLOCK = gql`
mutation ($userId: uuid!) {
  action_auth_locked_users_unlock(userId: $userId) {
    success
  }
}
`;

const headCells = [
    {id: 'unlock', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'username', numeric: false, disablePadding: false, label: 'Username'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'role', numeric: false, disablePadding: false, label: 'Role'},
    {id: 'authentication-type', numeric: false, disablePadding: false, label: 'Authentication'},
];

const LockedUsers = () => {
    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [query, setQuery] = useState(GET_LOCKED_USERS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [mutateLockUserUnlock,] = useMutation(LOCKED_USER_UNLOCK);

    useEffect(() => {
        handleChangeFilterText()
    }, [showFilterPanel])

    useEffect( () => {
        refetch();
    }, [])

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
    }

    const disableFilterQuery = () => {
    }

    const history = useHistory();

    const handleEditClick = async id => {
        await mutateLockUserUnlock({variables: {userId: id}});
        await refetch();
    }

    const [selectedItems, setSelectedItems] = useState([]);

    const handleClickDelete = (selected) => {
        console.log(selected)
        setSelectedItems(selected)
        setAlertDialogOpen(true);
    }

    const handleClickDeleteConfirm = async () => {
        console.log('deleting');
        console.log(selectedItems);
        // await deleteUserGroup({variables: {ids: selectedItems}});
        await refetch()
        setAlertDialogOpen(false);
    }

    const handleDialogClose = () => {
        setAlertDialogOpen(false);
    }

    const RowCells = ({row}) => {
        row = row.user;
        return (
            <>
                <TableCell align="right" style={{width: 50}}>
                    <Tooltip title="Unlock">
                        <IconButton onClick={e => handleEditClick(row.id)}
                                    color="primary"
                                    aria-label="Unlock">
                            <LockOpenIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell align="right" style={{width: 50, textAlign: 'center'}}>
                    { row.meta.authType === 'internal' &&
                        <Tooltip title="Internal">
                            <CloudOffIcon fontSize="small"/>
                        </Tooltip>
                    }
                    { row.meta.authType === 'external' &&
                        <Tooltip title="External">
                            <CloudQueueIcon fontSize="small"/>
                        </Tooltip>
                    }
                </TableCell>
            </>
        )
    }

    const ExtraToolbar = () => {

        return (
            <Tooltip title="Users">
                <IconButton aria-label="refresh" component={Link} to="users">
                    <PersonIcon/>
                </IconButton>
            </Tooltip>
        )
    }

    return (
        <div className={classes.root}>

            <EnhancedTable rowsSelectable={false} tableTitle="Locked Users" rows={data?.action_auth_locked_users ?? []} showProgress={loading}
                           rowsAddable={false} rowsFilterable={false}
                           headCells={headCells} rowCells={RowCells}
                           onClickDelete={handleClickDelete}
                           onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                           showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                           addLinkUrl="/dashboard/users/add"
                           extraToolbar={ExtraToolbar}
                           toolbarIcon={<PersonIcon style={{margin: '-4px 8px'}}/>}/>

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} onConfirm={handleClickDeleteConfirm}
                         itemsCount={selectedItems.length}/>
        </div>
    )
}

export default LockedUsers

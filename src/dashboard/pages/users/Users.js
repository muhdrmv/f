import React, {useEffect, useState} from 'react'
import {Link, useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import PersonIcon from "@material-ui/icons/Person";
import CloudOffIcon from '@material-ui/icons/CloudOff';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AssignmentIcon from "@material-ui/icons/Assignment";
import {VpnKey} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
}));

const GET_USERS = gql`
query {
  users(
    order_by: {created_at: desc}
  ) {
    id
    username
    name
    role
    meta
  }
}
`;

const GET_USERS_FILTERED = gql`
query Query($filter: String!) {
  users(
    order_by: {created_at: desc}, 
    where: {
    _or: [
      {name: {_like: $filter}}, 
      {username: {_like: $filter}}
    ]
  }) {
    id
    username
    name
    role
    meta
  }
}
`;

const DELETE_USER = gql`
mutation ($ids: [uuid!]) {
  delete_users(where: {id: {_in: $ids}}) {
    affected_rows
  }
}
`;

const headCells = [
    {id: 'edit', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'username', numeric: false, disablePadding: false, label: 'Username'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'role', numeric: false, disablePadding: false, label: 'Role'},
    {id: 'authentication-type', numeric: false, disablePadding: false, label: 'Authentication'},
];

const Users = ({loggedInUser}) => {
    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [query, setQuery] = useState(GET_USERS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [deleteUserGroup,] = useMutation(DELETE_USER);

    useEffect(() => {
        handleChangeFilterText()
    }, [showFilterPanel])

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
        if (showFilterPanel && e && e.target.value.trim() !== '') {
            enableFilterQuery('%' + e.target.value.trim() + '%');
        } else {
            disableFilterQuery();
        }
    }

    const enableFilterQuery = (filterText) => {
        setQuery(GET_USERS_FILTERED);
        setQueryVars({filter: filterText})
    }

    const disableFilterQuery = () => {
        setQuery(GET_USERS);
        setQueryVars({})
    }

    const history = useHistory();

    const handleEditClick = id => {
        history.push('/dashboard/users/' + id);
    }

    const handleViewClick = id => {
        history.push('/dashboard/users/' + id+'/view');
    }

    const handleAccessRulesClick = id => {
        history.push('/dashboard/users/' + id+'/access-rules');
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
        await deleteUserGroup({variables: {ids: selectedItems}});
        await refetch()
        setAlertDialogOpen(false);
    }

    const handleDialogClose = () => {
        setAlertDialogOpen(false);
    }

    const RowEditButton = ({onClick}) => {
        return (
        <Tooltip title="Edit">
            <IconButton onClick={onClick}
                        color="primary"
                        aria-label="edit" >
                <EditIcon fontSize="small"/>
            </IconButton>
        </Tooltip>
        )

    }

    const RowCells = ({row}) => {
        return (
            <>
                <TableCell align="right" style={{width: 180}}>

                    { loggedInUser.role === 'administrator' &&
                    <RowEditButton onClick={e => handleEditClick(row.id)} />
                    }

                    { loggedInUser.role === 'moderator' && ['user', 'supervisor', 'moderator'].includes(row.role) &&
                    <RowEditButton onClick={e => handleEditClick(row.id)} />
                    }

                    { loggedInUser.role === 'supervisor' && ['user', 'supervisor'].includes(row.role) &&
                    <RowEditButton onClick={e => handleEditClick(row.id)} />
                    }

                    <Tooltip title="Details">
                        <IconButton onClick={e => handleViewClick(row.id)}
                                    color="primary"
                                    aria-label="edit">
                            <AssignmentIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Access Rules">
                        <IconButton onClick={e => handleAccessRulesClick(row.id)}
                                    color="primary"
                                    aria-label="edit">
                            <VpnKey fontSize="small"/>
                        </IconButton>
                    </Tooltip>

                </TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell align="right" style={{width: 50, textAlign: 'center'}}>
                    {row.meta.authType === 'internal' &&
                    <Tooltip title="Internal">
                        <CloudOffIcon fontSize="small"/>
                    </Tooltip>
                    }
                    {row.meta.authType === 'external' &&
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
            <Tooltip title="Locked users">
                <IconButton aria-label="refresh" component={Link} to="users-locked">
                    <LockOutlinedIcon/>
                </IconButton>
            </Tooltip>
        )
    }

    return (
        <div className={classes.root}>
            <EnhancedTable tableTitle="Users" rows={data?.users ?? []} showProgress={loading}
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

export default Users

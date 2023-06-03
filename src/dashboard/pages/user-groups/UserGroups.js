import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import PeopleIcon from "@material-ui/icons/People";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
}));

const GET_USER_GROUPS = gql`
query Query {
  user_groups
    (order_by: {created_at: desc}) {
    description
    id
    name
    user_group_users_aggregate {
        aggregate {
          count
        }
    }
  }
}
`;

const GET_USER_GROUPS_FILTERED = gql`
query Query($filter: String!) {
  user_groups(
    order_by: {created_at: desc}, 
    where: {
    _or: [
      {name: {_like: $filter}}, 
      {description: {_like: $filter}}
    ]
  }) {
    description
    id
    name
    user_group_users_aggregate {
        aggregate {
          count
        }
    }
  }
}
`;

const DELETE_USER_GROUP = gql`
mutation ($ids: [uuid!]) {
  delete_user_groups(where: {id: {_in: $ids}}) {
    affected_rows
  }
}
`;

const headCells = [
    {id: 'edit', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'description', numeric: false, disablePadding: false, label: 'Description'},
    {id: 'users_count', numeric: false, disablePadding: false, label: 'Users Count'},
];

const UserGroups = () => {
    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [query, setQuery] = useState(GET_USER_GROUPS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [deleteUserGroup,] = useMutation(DELETE_USER_GROUP);

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
        setQuery(GET_USER_GROUPS_FILTERED);
        setQueryVars({filter: filterText})
    }

    const disableFilterQuery = () => {
        setQuery(GET_USER_GROUPS);
        setQueryVars({})
    }

    const history = useHistory();

    const handleEditClick = id => {
        history.push('/dashboard/user-groups/' + id);
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

    const RowCells = ({row}) => {
        return (
            <>
                <TableCell align="right" style={{width: 50}}>
                    <Tooltip title="Edit">
                        <IconButton onClick={e => handleEditClick(row.id)}
                                    color="primary"
                                    aria-label="edit">
                            <EditIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </TableCell>
                {/* <TableCell component="th" scope="row" padding="none">
                   {row.name}
                </TableCell> */}
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.user_group_users_aggregate.aggregate.count}</TableCell>
            </>
        )
    }

    return (
        <div className={classes.root}>
            
            <EnhancedTable tableTitle="User Groups" rows={data?.user_groups ?? []} showProgress={loading}
                            headCells={headCells} rowCells={RowCells}
                            onClickEdit={handleEditClick} onClickDelete={handleClickDelete}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                            addLinkUrl="/dashboard/user-groups/add"
                            toolbarIcon={<PeopleIcon style={{margin: '-4px 8px'}} />}/>

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} onConfirm={handleClickDeleteConfirm}
                            itemsCount={selectedItems.length}/>
        </div>
    )
}

export default UserGroups

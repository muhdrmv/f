import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import StorageIcon from '@material-ui/icons/Storage';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
}));

const GET_CONNECTION_GROUPS = gql`
query Query {
  connection_groups
    (order_by: {created_at: desc}) {
        id
        name
        description
        connection_group_connections_aggregate {
            aggregate {
                count
            }
        }
    }
}
`;

const GET_CONNECTION_GROUPS_FILTERED = gql`
query Query($filter: String!) {
    connection_groups(
        where: {
        _or: [
            {name: {_ilike: $filter}}, 
            {description: {_ilike: $filter}}
        ]
    }, order_by: {created_at: desc}) {
        id
        name
        description
        connection_group_connections_aggregate {
            aggregate {
                count
            }
        }
    }
}
`;

const DELETE_CONNECTION_GROUP = gql`
mutation ($ids: [uuid!]) {
    delete_connection_groups(where: {id: {_in: $ids}}) {
        affected_rows
    }
}
`;

const headCells = [
    {id: 'edit', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'description', numeric: false, disablePadding: false, label: 'Description'},
    {id: 'connections_count', numeric: false, disablePadding: false, label: 'Connections Count'},
];

const ConnectionGroups = () => {
    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [query, setQuery] = useState(GET_CONNECTION_GROUPS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [deleteUserGroup,] = useMutation(DELETE_CONNECTION_GROUP);

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
        setQuery(GET_CONNECTION_GROUPS_FILTERED);
        setQueryVars({filter: filterText})
    }

    const disableFilterQuery = () => {
        setQuery(GET_CONNECTION_GROUPS);
        setQueryVars({})
    }

    const history = useHistory();

    const handleEditClick = id => {
        history.push('/dashboard/connection-groups/' + id);
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
                <TableCell>{row.connection_group_connections_aggregate.aggregate.count}</TableCell>
            </>
        )
    }

    return (
        <div className={classes.root}>
            
            <EnhancedTable tableTitle="Connection Groups" rows={data?.connection_groups ?? []} showProgress={loading}
                            headCells={headCells} rowCells={RowCells}
                            onClickEdit={handleEditClick} onClickDelete={handleClickDelete}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                            addLinkUrl="/dashboard/connection-groups/add"
                            toolbarIcon={<StorageIcon style={{margin: '-4px 8px'}}/>} />

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} onConfirm={handleClickDeleteConfirm}
                            itemsCount={selectedItems.length}/>
        </div>
    )
}

export default ConnectionGroups

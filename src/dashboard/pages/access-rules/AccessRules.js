import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import VpnKeyIcon from '@material-ui/icons/VpnKey';


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
}));

const GET_ACCESS_RULES = gql`
query {
  access_rules(
      order_by: {created_at: desc}
  ) {
    id
    name
    meta
    access_rule_connection_groups_aggregate {
      aggregate {
        count
      }
    }
    access_rule_connections_aggregate {
      aggregate {
        count
      }
    }
    access_rule_user_groups_aggregate {
      aggregate {
        count
      }
    }
    access_rule_users_aggregate {
      aggregate {
        count
      }
    }
  }
}
`;

const GET_ACCESS_RULES_FILTERED = gql`
query ($filter: String!) {
  access_rules(
    order_by: {created_at: desc}, 
    where: {
    _or: [
      {name: {_ilike: $filter}}, 
    ]
  }) {
    id
    name
    meta
    access_rule_connection_groups_aggregate {
      aggregate {
        count
      }
    }
    access_rule_connections_aggregate {
      aggregate {
        count
      }
    }
    access_rule_user_groups_aggregate {
      aggregate {
        count
      }
    }
    access_rule_users_aggregate {
      aggregate {
        count
      }
    }
  }
}
`;

const DELETE_ACCESS_RULES = gql`
mutation ($ids: [uuid!]) {
  delete_access_rules(where: {id: {_in: $ids}}) {
    affected_rows
  }
}
`;

const headCells = [
    {id: 'edit', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'users', numeric: false, disablePadding: false, label: 'Users (Groups)'},
    {id: 'connections', numeric: false, disablePadding: false, label: 'Connections (Groups)'},
    {id: 'upload', numeric: false, disablePadding: false, label: 'Upload'},
    {id: 'download', numeric: false, disablePadding: false, label: 'Download'},
    {id: 'clipboard', numeric: false, disablePadding: false, label: 'Clipboard'},
];

const AccessRules = () => {
    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [query, setQuery] = useState(GET_ACCESS_RULES);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [deleteUserGroup,] = useMutation(DELETE_ACCESS_RULES);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        handleChangeFilterText()
    }, [showFilterPanel])

    useEffect( () => {
        refetch();
    }, [])

    useEffect( () => {
        const gotRows = data?.access_rules ?? [];
        setRows(gotRows.map(v => ({
            id: v.id,
            name: v.name,
            users: `${v.access_rule_users_aggregate.aggregate.count} (${v.access_rule_user_groups_aggregate.aggregate.count})`,
            connections: `${v.access_rule_connections_aggregate.aggregate.count} (${v.access_rule_connection_groups_aggregate.aggregate.count})`,
            upload: v.meta.canUpload ? '✓' : '',
            download: v.meta.canDownload ? '✓' : '',
            clipboard: (v.meta.canCopy || v.meta.canPaste) ? '✓' : '',
        })));

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
        setQuery(GET_ACCESS_RULES_FILTERED);
        setQueryVars({filter: filterText})
    }

    const disableFilterQuery = () => {
        setQuery(GET_ACCESS_RULES);
        setQueryVars({})
    }

    const history = useHistory();

    const handleEditClick = id => {
        history.push('/dashboard/access-rules/' + id);
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
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.users}</TableCell>
                <TableCell>{row.connections}</TableCell>
                <TableCell>{row.upload}</TableCell>
                <TableCell>{row.download}</TableCell>
                <TableCell>{row.clipboard}</TableCell>
            </>
        )
    }

    return (
        <div className={classes.root}>
            <EnhancedTable tableTitle="Access Rules" rows={rows} showProgress={loading}
                            headCells={headCells} rowCells={RowCells}
                            onClickDelete={handleClickDelete}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                            addLinkUrl="/dashboard/access-rules/add"
                            toolbarIcon={<VpnKeyIcon style={{margin: '-4px 8px'}}/>} />

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} onConfirm={handleClickDeleteConfirm}
                            itemsCount={selectedItems.length}/>
        </div>
    )
}

export default AccessRules

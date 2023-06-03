import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom';
import {IconButton, TableCell, Tooltip} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import {gql, useMutation, useQuery} from "@apollo/client";
import AlertDialog from "./AlertDialog";
import EnhancedTable from "../../shared-components/EnhancedTable";
import DnsIcon from '@material-ui/icons/Dns';
import {VpnKey} from "@material-ui/icons";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > *': {
            // margin: theme.spacing(1),
        },
    },
}));

const GET_CONNECTIONS = gql`
query Query {
  connections
    (order_by: {created_at: desc}) {
    id
    name
    protocol
    hostname
  }
}
`;

const GET_CONNECTIONS_FILTERED = gql`
query Query($filter: String!) {
  connections(
    order_by: {created_at: desc}, 
    where: {
    _or: [
      {name: {_ilike: $filter}}, 
      {hostname: {_ilike: $filter}}
    ]
  }) {
    id
    name
    protocol
    hostname
  }
}
`;

const DELETE_CONNECTION = gql`
mutation ($ids: [uuid!]) {
  delete_connections(where: {id: {_in: $ids}}) {
    affected_rows
  }
}
`;

const headCells = [
    {id: 'edit', numeric: false, disablePadding: true, label: '', width: '50px'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'protocol', numeric: false, disablePadding: false, label: 'Protocol'},
    {id: 'hostname', numeric: false, disablePadding: false, label: 'Hostname'},
];

const Connections = () => {
    const classes = useStyles();
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [query, setQuery] = useState(GET_CONNECTIONS);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [queryVars, setQueryVars] = useState({});
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});
    const [deleteUserGroup,] = useMutation(DELETE_CONNECTION);

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
        setQuery(GET_CONNECTIONS_FILTERED);
        setQueryVars({filter: filterText})
    }

    const disableFilterQuery = () => {
        setQuery(GET_CONNECTIONS);
        setQueryVars({})
    }

    const history = useHistory();

    const handleEditClick = id => {
        history.push('/dashboard/connections/' + id);
    }

    const handleAccessRulesClick = id => {
        history.push('/dashboard/connections/' + id+'/access-rules');
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
                <TableCell align="right" style={{width: 130}}>

                    <Tooltip title="Edit">
                        <IconButton onClick={e => handleEditClick(row.id)}
                                    color="primary"
                                    aria-label="edit">
                            <EditIcon fontSize="small"/>
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
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.protocol}</TableCell>
                <TableCell>{row.hostname}</TableCell>
            </>
        )
    }

    return (
        <div className={classes.root}>
            
            <EnhancedTable tableTitle="Connections" rows={data?.connections ?? []} showProgress={loading}
                            headCells={headCells} rowCells={RowCells}
                            onClickDelete={handleClickDelete}
                            onClickRefresh={handleRefresh} onClickFilter={handleClickFilter}
                            showFilterPanel={showFilterPanel} onChangeFilterText={handleChangeFilterText}
                            addLinkUrl="/dashboard/connections/add"
                            toolbarIcon={<DnsIcon style={{margin: '-4px 8px'}}/>}/>

            <AlertDialog isOpen={alertDialogOpen} closeMe={handleDialogClose} onConfirm={handleClickDeleteConfirm}
                            itemsCount={selectedItems.length}/>
        </div>
    )
}

export default Connections

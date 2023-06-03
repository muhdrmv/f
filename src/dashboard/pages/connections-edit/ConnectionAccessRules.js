import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Grid, IconButton, Paper, TableCell, Tooltip} from '@material-ui/core';
import {useHistory, useParams} from "react-router-dom";
import {gql, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import 'date-fns';
import EditIcon from "@material-ui/icons/Edit";
import EnhancedTable from "../../shared-components/EnhancedTable";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    },
    form: {
        padding: theme.spacing(2),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
        padding: "1px",
        paddingLeft: "10px",
        textAlign: "left",
        paddingBottom: "10px",
        height:"100%"
    },

}));

const CONNECTION_ACCESS_RULES = gql`
query ($id: uuid!) {
  connections_by_pk(id: $id) {
    connection_group_connections {
      connection_group {
        name
        access_rule_connection_groups {
          access_rule {
            id
            name
            meta
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
          }
        }
      }
    }
    access_rule_connections {
      access_rule {
        id
        name
        meta
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
      }
    }
  }
}
`;


const ConnectionAccessRules = ({insertMode = false, loggedInUser}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);

    const [items, setItems] = useState([]);
    const {id} = useParams();
    const {loading, error, data, refetch} = useQuery(CONNECTION_ACCESS_RULES, {variables: {id}, notifyOnNetworkStatusChange: true});
    const [rows, setRows] = useState([]);
    const [groupRows, setGroupRows] = useState([]);

    const headCells = [
        {id: 'edit', numeric: false, disablePadding: true, label: '', width: '50px'},
        {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
        {id: 'users', numeric: false, disablePadding: false, label: 'Users (Groups)'},
        {id: 'connections', numeric: false, disablePadding: false, label: 'Connections (Groups)'},
        {id: 'upload', numeric: false, disablePadding: false, label: 'Upload'},
        {id: 'download', numeric: false, disablePadding: false, label: 'Download'},
        {id: 'clipboard', numeric: false, disablePadding: false, label: 'Clipboard'},
    ];

    useEffect( () => {
        const gotRows = data?.connections_by_pk?.access_rule_connections ?? [];
        setRows(gotRows.map(v => ({
            id: v.access_rule.id,
            name: v.access_rule.name,
            users: `${v.access_rule.access_rule_users_aggregate.aggregate.count} (${v.access_rule.access_rule_user_groups_aggregate.aggregate.count})`,
            connections: `${v.access_rule.access_rule_connections_aggregate.aggregate.count} (${v.access_rule.access_rule_connection_groups_aggregate.aggregate.count})`,
            upload: v.access_rule.meta.canUpload ? '✓' : '',
            download: v.access_rule.meta.canDownload ? '✓' : '',
            clipboard: (v.access_rule.meta.canCopy || v.access_rule.meta.canPaste) ? '✓' : '',
        })));
    }, [data])

    useEffect( () => {
        const gotRows = data?.connections_by_pk?.connection_group_connections ?? [];
        setGroupRows(gotRows.map(g => ({
            name: g.connection_group.name,
            access_rules: g.connection_group.access_rule_connection_groups.map(v => ({
                id: v.access_rule.id,
                name: v.access_rule.name,
                users: `${v.access_rule.access_rule_users_aggregate.aggregate.count} (${v.access_rule.access_rule_user_groups_aggregate.aggregate.count})`,
                connections: `${v.access_rule.access_rule_connections_aggregate.aggregate.count} (${v.access_rule.access_rule_connection_groups_aggregate.aggregate.count})`,
                upload: v.access_rule.meta.canUpload ? '✓' : '',
                download: v.access_rule.meta.canDownload ? '✓' : '',
                clipboard: (v.access_rule.meta.canCopy || v.access_rule.meta.canPaste) ? '✓' : '',
            }))
        })));
    }, [data])


    const handleRefresh = () => {
        refetch();
    }

    const handleEditClick = accessRuleId => {
        history.push({
            pathname: '/dashboard/access-rules/' + accessRuleId,
            state: {
                backUrl: `/dashboard/connections/${id}/access-rules`,
            }
        });
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
    };


    useEffect(() => {
        if (data) {
            setInProgress(false);
        } else {
            !insertMode && setInProgress(true);
        }
    }, [data]);

    const history = useHistory();

    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>
                <TopToolbar toolbarTitle={"Connection Access Rules"} backLinkUrl="/dashboard/connections"
                            inProgress={inProgress} toolbarIcon={<VpnKeyIcon style={{margin: '-4px 8px'}}/>} />

                <div className={classes.root} style={{padding: "20px"}}>
                    <Grid container spacing={3}>
                        <EnhancedTable tableTitle="Direct Access Rules" rows={rows ?? []} showProgress={loading}
                                       headCells={headCells} rowCells={RowCells}
                                       rowsSelectable={false} rowsAddable={false} rowsFilterable={false}
                                       onClickRefresh={handleRefresh} />
                    </Grid>
                </div>

                { groupRows.map( connectionGroup =>
                    <div className={classes.root} style={{padding: "20px"}}>
                        <Grid container spacing={3}>
                            <EnhancedTable tableTitle={"Connection Group Access Rules: "+connectionGroup.name} rows={connectionGroup.access_rules ?? []} showProgress={loading}
                                           headCells={headCells} rowCells={RowCells}
                                           rowsSelectable={false} rowsAddable={false} rowsFilterable={false}
                                           onClickRefresh={handleRefresh} />
                        </Grid>
                    </div>
                )}


            </Paper>

        </div>


    )
}

export default ConnectionAccessRules

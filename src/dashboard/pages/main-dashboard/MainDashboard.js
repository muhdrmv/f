import React, {useEffect, useState} from 'react'
import ConnectionBox from './ConnectionBox';
import {Grid, Paper} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';
import {gql, useQuery} from "@apollo/client";
import {windowAddActivityEventListeners} from "../../../utilities/Utils";
import TopToolbar from "../../shared-components/TopToolbar";
import TextField from '@material-ui/core/TextField';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({

    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    parentPaper: {
      backgroundColor: '#eeeeee',
      padding: theme.spacing(2),
    }
}));

const QUERY_ACCESS_RULES = gql`
query ($user_id: uuid!) {
  
  access_rules(where: {access_rule_users: {user_id: {_eq: $user_id}}}) {
    
    id
    name
    
    # user to connection
    access_rule_connections {
      connection {
        id
        name
        protocol
        hostname
        meta
      }
    }
    
    # user to connection_group to connection
    access_rule_connection_groups {
      connection_group {
        connection_group_connections {
          connection {
            id
            name
            protocol
            hostname  
            meta          
          }
        }
      }
    }
  }

  user_group_user(where: {user_id: {_eq: $user_id}}) {
    user_group {
      access_rule_user_groups {
        access_rule {
          
          id
          name
          
          # user to user_group to connection
          access_rule_connections {
            connection {
              id
              name
              protocol
              hostname       
              meta     
            }       
          }
          
          # user to user_group to connection_group to connection
          access_rule_connection_groups {
            connection_group {
              connection_group_connections {
                connection {
                  id
                  name
                  protocol
                  hostname      
                  meta      
                }
              }
            }            
          }
          
        }
      }
    }
  }
}

`;
const QUERY_ACCESS_RULES_FILTER = gql`

  query Query($user_id: uuid!, $filter: String!) {
    access_rules( 
      where: { 
        _and: [ 
          { access_rule_users: {user_id: {_eq: $user_id}}}, 
          { _or: [
            { access_rule_connections: {connection: {name: {_ilike: $filter}}}},
            { access_rule_connection_groups: {connection_group: {connection_group_connections: {connection: {name: {_ilike: $filter}}}}}}
          ]}
        ]
      } 
    ){

      id
      name
      access_rule_connections (where: {connection: {name: {_ilike: $filter}}}){
        connection {
          id
          name
          protocol
          hostname
          meta
        }
      }
      access_rule_connection_groups (where: {connection_group: {connection_group_connections: {connection: {name: {_ilike: $filter}}}}}) {
        connection_group {
          connection_group_connections {
            connection {
              id
              name
              protocol
              hostname
              meta
            }
          }
        }
      }
    }



    user_group_user(
      where: { 
        user_id: {_eq: $user_id}, 
      }
    ){
      user_group {
        access_rule_user_groups {
          access_rule {
            
            id
            name
            
            # user to user_group to connection
            access_rule_connections (where: {connection: {name: {_ilike: $filter}}}) {
              connection {
                id
                name
                protocol
                hostname       
                meta     
              }       
            }
            
            # user to user_group to connection_group to connection
            access_rule_connection_groups {
              connection_group {
                connection_group_connections (where: {connection: {name: {_ilike: $filter }}}) {
                  connection {
                    id
                    name
                    protocol
                    hostname      
                    meta      
                  }
                }
              }            
            }
            
          }
        }
      }
    }
  }
`;

const flattenUserAccessRules = data => {
    const extractAccessRuleConnections = ar => {
        let accesses = [];
        accesses = [...accesses, ...ar.access_rule_connections.map(c => c.connection)];
        accesses = accesses.map(c => ({connection: c, accessRule: ar}));
        return accesses;
    }
    const extractAccessRuleConnectionGroups = ar => {
        let accesses = [];
        ar.access_rule_connection_groups.forEach(cg => {
            accesses = [...accesses, ...cg.connection_group.connection_group_connections.map(c => c.connection)];
        });
        accesses = accesses.map(c => ({connection: c, accessRule: ar}));
        return accesses;
    };

    let user2connections = [];
    let user2connectionGroup2connection = [];
    data.access_rules.forEach(ar => {
        user2connections = [...user2connections, ...extractAccessRuleConnections(ar)];
        user2connectionGroup2connection = [...user2connectionGroup2connection, ...extractAccessRuleConnectionGroups(ar)];
    });

    let userGroup2connections = [];
    let userGroup2connectionGroup = [];
    data.user_group_user.forEach(ug => {
        ug.user_group.access_rule_user_groups.forEach(ar => {
            userGroup2connections = [...userGroup2connections, ...extractAccessRuleConnections(ar.access_rule)];
            userGroup2connectionGroup = [...userGroup2connectionGroup, ...extractAccessRuleConnectionGroups(ar.access_rule)];
        });
    });

    // aggregate and deduplicate
    const allConnectionAccesses = [...user2connections, ...user2connectionGroup2connection, ...userGroup2connections, ...userGroup2connectionGroup];
    const dedupConnectionAccesses = allConnectionAccesses.filter( (v,i,a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i)
    return dedupConnectionAccesses;
};

const MainDashboard = ({loggedInUser, openWindows, lastWindowActivityAt}) => {

    const [connectionAccesses, setConnectionAccesses] = useState([]);
    const userId = loggedInUser.id;

    const [queryVars, setQueryVars] = useState({user_id: userId});
    const [query, setQuery] = useState(QUERY_ACCESS_RULES);
    const {loading, error, data, refetch} = useQuery(query, {variables: queryVars});
  
    useEffect( () => {
      refetch();
    }, []);

    useEffect(() => {
        if (!data) return;
        const connectionAccesses = flattenUserAccessRules(data);
        setConnectionAccesses(connectionAccesses);
    }, [data]);

    const handleClickConnect = async (connectionId, accessRuleId) => {
        const windowOpen = window.open(`./connect?c=${connectionId}&a=${accessRuleId}`, '_blank');
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(9000);
        const updateActivity = () => {lastWindowActivityAt.current = new Date()};
        windowAddActivityEventListeners(windowOpen, updateActivity);
        openWindows.current.push(windowOpen);
    }

    const classes = useStyles();
    const fixedHeightPaper = clsx(classes.paper);
    const [ filterVisibility, setFilterVisibility ] = React.useState(false);

    useEffect(() => {
        handleChangeFilterText()
    }, [filterVisibility])

    const handleChangeFilterText = (e) => {
        if (filterVisibility && e && e.target.value.trim() !== '') {
            enableFilterQuery('%' + e.target.value.trim() + '%');
        } else {
            disableFilterQuery();
        }
    }

    const enableFilterQuery = (filterText) => {
        setQuery(QUERY_ACCESS_RULES_FILTER);
        setQueryVars({filter: filterText, user_id: userId})
    }

    const disableFilterQuery = () => {
        setQuery(QUERY_ACCESS_RULES);
        setQueryVars({ user_id: userId})
    }

    return (

        <div className={classes.root} style={{width: "100%"}}>
          {
            filterVisibility && 
            <Paper className={classes.paper} style={{marginBottom: '10px'}}>
              {
                <div>
                    <TextField 
                      id="outlined-basic" 
                      label="Connection Name Filter" variant="outlined" autoFocus={true}
                      onChange={handleChangeFilterText}
                      style={{margin: '1%', width: '98%'}}
                    />
                </div>
              }
            </Paper>  
          }

          <Paper className={classes.parentPaper} container spacing={3} style={{width: "100%", padding: '20px'}}>

            <Grid container>
              <Grid item xs={12} md={6} lg={6} key={'toolbar'}>
                <TopToolbar toolbarTitle="" />
              </Grid>
              <Grid item xs={12} md={6} lg={6} style={{textAlign: 'right'}} key={'filter'}>
                <Tooltip title="Filter">
                    <IconButton aria-label="filter" onClick={()=>{setFilterVisibility(f => !f)}}>
                        <FilterListIcon/>
                    </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            
            <Grid container spacing={3}>
              <>
                { 
                  connectionAccesses.map(ca =>
                    (ca.connection.meta.isDisabled !== true) &&
                    <Grid item xs={12} md={4} lg={3} style={{textAlign: 'center'}} key={ca?.connection?.accessRule?.name}>
                        <Paper className={fixedHeightPaper}>
                            <ConnectionBox
                                onClickConnect={() => {
                                    handleClickConnect(ca.connection.id, ca.accessRule.id)
                                }}
                                name={ca.connection.name}
                                protocol={ca.connection.protocol.toUpperCase()}
                                accessRule={ca.accessRule.name}
                            />
                        </Paper>
                    </Grid>
                  )
                }
              </>
            </Grid>
          </Paper>
        </div>
    );
}

export default MainDashboard

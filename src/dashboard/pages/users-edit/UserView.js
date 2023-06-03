import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Chip, Grid, Paper} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {useParams} from "react-router-dom";
import {gql, useLazyQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import 'date-fns';
import CloudOffIcon from "@material-ui/icons/CloudOff";
import CloudQueueIcon from "@material-ui/icons/CloudQueue";
import CancelIcon from '@material-ui/icons/Cancel';
import {changeTimeZone} from "../../../utilities/Utils";
import LogsBox from "../../shared-components/LogsBox";

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
    },

}));

const QUERY_USER = gql`
query ($id: uuid!) {
  users_by_pk(id: $id){
    id
    username
    password
    name
    role
    meta
    user_group_users {
        user_group_id,
        user_group{
            name
        }
    }
  }
}
`;


const UserView = ({insertMode = false, loggedInUser}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState("");
    const [auth, setAuth] = useState("");
    const [expires, setExpires] = useState("");
    const [disable, setDisable] = useState("");
    const [userGroup,setUserGroup] = useState([])
    const [mostChangePassword, setMostChangePassword] = useState("");
    const [tags, setTags] = useState([]);

    const {id} = useParams();


    const [queryData, {data}] = useLazyQuery(QUERY_USER, {
        variables: {id: id},
    });

    useEffect(() => {
        if (!insertMode) {
            queryData();
        }
    }, []);

    useEffect(() => {
        if (data) {
            const user = data.users_by_pk;
            setName(user.name);
            setRole(user.role)
            setUsername(user.username);
            setAuth(user.meta.authType);
            setExpires(user.meta.expiresAt)
            setDisable(user.meta.isDisabled)
            setUserGroup(user.user_group_users)
            setMostChangePassword(user.meta.mustChangePassword)
            const userGroupIds = user.user_group_users.map(i => i.user_group_id);
            setTags(userGroupIds);
            setInProgress(false);
        } else {
            !insertMode && setInProgress(true);
        }
    }, [data]);

    const defaultWhere = {
        meta: {
            _contains: {
                entity_id: id
            }
        }
    };

    return (
        <div className={classes.root} style={{width: '100%'}}>

            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={"User Details"} backLinkUrl="/dashboard/users"
                            inProgress={inProgress}/>

                <div className={classes.root} style={{padding: "20px"}}>




                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>Username: </h3>
                                <span>
                                    {username}
                                </span>
                            </Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>Name: </h3><span>{name}</span></Paper>
                        </Grid>

                        <Grid item xs={4}>
                            <Paper style={{textTransform: "capitalize"}} className={classes.paper}><h3>Role: </h3>

                                <Chip
                                    label={role}
                                    color="primary"
                                />


                            </Paper>
                        </Grid>

                        <Grid item xs={4}>
                            <Paper style={{textTransform: "capitalize"}} className={classes.paper}><h3>Authentication
                                Type: </h3>
                                <span>{auth === "internal" ?
                                    (
                                        <Chip
                                            icon={<CloudOffIcon fontSize="small"/>}
                                            label={"internal"}
                                            color="primary"
                                        />) :
                                    (<Chip
                                        icon={<CloudQueueIcon fontSize="small"/>}
                                        label={"external"}
                                        color="primary"
                                    />)
                                }
                                </span>
                            </Paper>
                        </Grid>

                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>Expires at: </h3>
                                <span>{expires && changeTimeZone(expires)}</span>
                                <span>{!expires && "Not Existed"}</span>
                            </Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>Disabled: </h3>

                                <span>{disable ? (
                                        <Chip
                                            icon={<CheckCircleIcon fontSize={"small"}/>}
                                            label={"Yes"}
                                            color="primary"
                                        />


                                    )
                                    :
                                    (

                                        <Chip
                                            icon={<CancelIcon fontSize={"small"}/>}
                                            label={"No"}
                                            color="primary"
                                        />

                                    )
                                }
                                </span>
                            </Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>Must Change Password: </h3>
                                <span>{mostChangePassword ? (
                                        <Chip
                                            icon={<CheckCircleIcon fontSize={"small"}/>}
                                            label={"Yes"}
                                            color="primary"
                                        />

                                    )
                                    :
                                    (

                                        <Chip
                                            icon={<CancelIcon fontSize={"small"}/>}
                                            label={"No"}
                                            color="primary"
                                        />

                                    )
                                }
                                </span>
                            </Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}><h3>User Groups: </h3>
                                {userGroup.map(item=>(
                                    <Chip style={{marginLeft:"5px"}}
                                          label={item.user_group.name}
                                          color="primary"
                                    />
                                ))}
                            </Paper>
                        </Grid>

                    </Grid>
                </div>
            </Paper>

            <LogsBox tableTitle="User Logs" defaultWhere={defaultWhere} rowsFilterable={false}/>

        </div>
    )
}

export default UserView

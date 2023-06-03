import React, {useEffect, useState} from 'react'
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import {TextField} from '@material-ui/core';
import CheckboxesTags from '../../shared-components/CheckboxesTags';
import {useHistory, useParams} from "react-router-dom";
import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import TopToolbar from '../../shared-components/TopToolbar';
import Snackbar from '@material-ui/core/Snackbar';
import BottomToolbar from '../../shared-components/BottomToolbar';

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
    },

}));

const QUERY_USER_GROUP = gql`
query ($id: uuid!) {
  user_groups_by_pk(id: $id){
    id
    name
    description
    user_group_users {
        user_id
    }
  }
}
`;

const INSERT_USER_GROUP = gql`
mutation ($name: String!, $description: String!, $users: [user_group_user_insert_input!]!) {
  insert_user_groups(objects: {
      name: $name, 
      description: $description, 
      user_group_users: {data: $users},
    }) {
    returning {
      id
    }
  }
}
`;

const UPDATE_USER_GROUP = gql`
mutation ($name: String!, $description: String!, $users: [user_group_user_insert_input!]!, $id: uuid!) {
  update_user_groups_by_pk(pk_columns: {id: $id}, _set: {
      name: $name, 
      description: $description,
    }) {
    id
  }
  delete_user_group_user (where: {user_group_id: {_eq: $id}}) {
    affected_rows
  }
  insert_user_group_user (objects: $users) {
    affected_rows
  }
}
`;

const GET_USERS = gql`
query {
  users {
    id
    username
  }
}
`;

const UserGroupEdit = ({insertMode = false}) => {
    const classes = useStyles();

    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [items, setItems] = useState([]);
    const [validationError, setValidationError] = useState(false);
    const [snackbarState, setSnackbarState] = useState({
        isOpen: false,
        message: ''
    });
    const {id} = useParams();

    const handleQueryCompletedUsers = data => {
        const checkboxItems = data.users.map(user => ({id: user.id, title: user.username}));
        setItems(checkboxItems);
    };

    const [queryData, { data }] = useLazyQuery(QUERY_USER_GROUP, {
        variables: {id: id},
    });

    useEffect(() => {
        if (!insertMode) {
            queryData();
        }
    }, []);

    useEffect(()=>{
        if (data) {
            const userGroup = data.user_groups_by_pk;
            setName(userGroup.name);
            setDescription(userGroup.description);
            const userIds = userGroup.user_group_users.map( i => i.user_id );
            setTags(userIds);
            setInProgress(false);
        } else {
            !insertMode && setInProgress(true);
        }
    }, [data]);

    
    useQuery(GET_USERS, {
        onCompleted: handleQueryCompletedUsers,
    });

    const [insertUserGroup,] = useMutation(INSERT_USER_GROUP);
    const [updateUserGroup,] = useMutation(UPDATE_USER_GROUP);

    const handleChangeName = (e) => {
        setName(e.target.value);
        setValidationError(false);
    }

    const handleChangeDescription = (e) => {
        setDescription(e.target.value);
    }

    const handleChangeTags = (e, v) => {
        console.log(v);
        const selectedIds = v.map(i=>i.id);
        setTags(selectedIds);
    };

    const history = useHistory();

    const handleFormSubmit = async e => {

        if (name.trim() === '') {
            setValidationError(true);
            return;
        }

        setInProgress(true);
        let mutationResult;
        const userIds = tags.map( i => ({user_id: i, user_group_id: id}) );
        try {
            if (insertMode)
                mutationResult = await insertUserGroup({variables: {name: name, description: description, users: userIds}});
            else
                mutationResult = await updateUserGroup({variables: {name: name, description: description, users: userIds, id:id}});

            console.log(mutationResult);
            setSnackbarState({message: 'Successful', isOpen: true})
            setTimeout(()=>{
                setSnackbarState( s => ({...s, isOpen: false}) );
            }, 1000);
            history.push('/dashboard/user-groups');
        } catch (e) {
            console.log(e)
            alert('Data access error');
        }
        setInProgress(false);
    };


    return (
        <div className={classes.root} style={{width: '100%'}}>
            <Paper className={classes.paper}>

                <TopToolbar toolbarTitle={ (insertMode ? "Add" : "Edit") + " User Group" } backLinkUrl="/dashboard/user-groups"
                    onClickDone={handleFormSubmit} inProgress={inProgress} />

                <div className={classes.root}>
                    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>

                        <TextField id="name" label="Group Name" variant="outlined" onChange={handleChangeName} fullWidth 
                                value={name}  error={validationError} required />

                        <TextField id="description" label="Description" variant="outlined" fullWidth 
                                onChange={handleChangeDescription}
                                value={description}/>

                        <CheckboxesTags id="users" label="Users" placeholder="Username" items={items} fullWidth
                                        selectedIds={tags} onChange={handleChangeTags} />

                        
                        <BottomToolbar backLinkUrl="/dashboard/user-groups" onClickDone={handleFormSubmit} inProgress={inProgress} />

                    </form>
                </div>
            </Paper>

            <Snackbar
                open={snackbarState.isOpen}
                // onClose={handleSnackbarClose}
                // TransitionComponent={(<Slide direction="up" />)}
                message={snackbarState.message}
                // key={SlideTransition.name}
            />
        </div>

        
    )
}

export default UserGroupEdit
